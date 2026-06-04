"""
spell_corrector.py
==================
Medical-aware spell correction using SymSpell.

Strategy
--------
1. Load SymSpell's bundled 82 k English frequency dictionary (ships with the
   symspellpy package — no extra download required).
2. Overlay a medical term dictionary so condition names, anatomy, and drug
   names are never "corrected" away.
3. Correct only words that are NOT already in the combined vocabulary, using
   a conservative max_edit_distance=2.  Words the corrector cannot resolve
   are returned unchanged (lookup returns an empty list → keep original).

Why per-word lookup instead of lookup_compound() on the whole string?
   lookup_compound() rewrites the entire sentence and is too aggressive on
   medical jargon.  Per-word lookup with a medical whitelist is safer.

Previous implementation flaw:
   The old code built a SymSpell dictionary from *only* ~300 medical words
   then called lookup_compound(text, max_edit_distance=2).  SymSpell
   aggressively corrected every unknown word toward the nearest entry in that
   tiny dictionary, silently garbling real symptom text before it reached the
   BERT tokenizer (e.g. "abdominal cramps" → garbled).
"""

from __future__ import annotations

import re
from typing import Optional

_sym: Optional[object] = None
_LOAD_FAILED = False

_MEDICAL_WHITELIST: set[str] = {
    "abdominal","abdomen","thoracic","lumbar","cervical","occipital",
    "parietal","temporal","frontal","cranial","vertebral","thorax",
    "pectoris","cardiac","cardio","myocardial","pericardial",
    "pulmonary","bronchial","tracheal","laryngeal","pharyngeal",
    "esophageal","gastric","duodenal","intestinal","colonic",
    "hepatic","biliary","pancreatic","renal","urinary","ureteral",
    "bladder","urethral","musculoskeletal","articular","synovial",
    "ligament","tendon","lymphatic","vascular","arterial","venous",
    "neurological","cerebral","cortical","spinal","peripheral",
    "dermatological","subcutaneous","epidermal",
    "dyspnea","dyspnoea","tachycardia","bradycardia","palpitations",
    "hypertension","hypotension","tachypnea","haemoptysis","hemoptysis",
    "haematuria","hematuria","haematemesis","melena","epistaxis",
    "syncope","vertigo","tinnitus","diplopia","dysphagia",
    "dysuria","polyuria","oliguria","nocturia","haematochezia",
    "constipation","diarrhoea","diarrhea","nausea","vomiting",
    "anorexia","pyrexia","hypothermia","myalgia","arthralgia",
    "neuralgia","cephalgia","migraine","somnolence","insomnia",
    "pruritus","urticaria","erythema","oedema","edema","cyanosis",
    "jaundice","pallor","diaphoresis","alopecia","xerostomia",
    "paraesthesia","paresthesia","dysesthesia","ataxia","tremor",
    "seizure","convulsion","aphasia","dysarthria","amnesia",
    "dementia","delirium","psychosis","hallucination","anhedonia",
    "uti","ibs","ibd","gerd","copd","ptsd","adhd","ocd",
    "covid","dengue","malaria","typhoid","tuberculosis","hiv",
    "diabetes","hyper","hypo","eczema","psoriasis","asthma",
    "pneumonia","bronchitis","sinusitis","otitis","conjunctivitis",
    "appendicitis","cholecystitis","pancreatitis","hepatitis",
    "nephritis","cystitis","pyelonephritis","colitis","gastritis",
    "peritonitis","meningitis","encephalitis","myositis","tendinitis",
    "bursitis","arthritis","osteoporosis","scoliosis","kyphosis",
    "antibiotic","analgesic","antipyretic","antihistamine","anticoagulant",
    "antihypertensive","antidiabetic","antiemetic","antifungal",
    "antiviral","antidepressant","anxiolytic","antipsychotic",
    "corticosteroid","immunosuppressant","bronchodilator","diuretic",
    "vasodilator","vasoconstrictor","intravenous","subcutaneous",
    "intramuscular","sublingual","topical","inhaler","nebulizer",
    "paracetamol","ibuprofen","aspirin","metformin","insulin",
    "amlodipine","atorvastatin","omeprazole","amoxicillin",
    "azithromycin","ciprofloxacin","metronidazole","fluconazole",
    "cetirizine","loratadine","fexofenadine","montelukast",
    "salbutamol","prednisolone","dexamethasone","warfarin",
    "heparin","clopidogrel","losartan","enalapril","lisinopril",
}


def _load_symspell() -> Optional[object]:
    """Lazy-load SymSpell with the bundled English frequency dictionary."""
    global _sym, _LOAD_FAILED
    if _sym is not None:
        return _sym
    if _LOAD_FAILED:
        return None
    try:
        from symspellpy import SymSpell
        import symspellpy, os

        sym = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)

        pkg_dir   = os.path.dirname(symspellpy.__file__)
        dict_path = os.path.join(pkg_dir, "frequency_dictionary_en_82_765.txt")
        bigram    = os.path.join(pkg_dir, "frequency_bigramdictionary_en_243_342.txt")

        if not os.path.isfile(dict_path):
            raise FileNotFoundError(f"SymSpell dictionary not found at {dict_path}")

        sym.load_dictionary(dict_path, term_index=0, count_index=1)
        if os.path.isfile(bigram):
            sym.load_bigram_dictionary(bigram, term_index=0, count_index=2)

        for term in _MEDICAL_WHITELIST:
            sym.create_dictionary_entry(term, 100_000)

        _sym = sym
        print("[SpellCorrector] Loaded: 82k English dict + medical overlay.")
        return sym

    except Exception as exc:
        _LOAD_FAILED = True
        print(f"[SpellCorrector] Load failed ({exc}). Spell correction disabled.")
        return None


def _is_whitelisted(word: str) -> bool:
    return word.lower() in _MEDICAL_WHITELIST


def correct(text: str) -> str:
    """
    Return spell-corrected symptom text.

    - Skips non-alpha tokens (numbers, punctuation).
    - Skips tokens ≤3 chars (abbreviations like UTI, IV).
    - Skips whitelisted medical terms.
    - For remaining tokens: SymSpell per-word lookup (max_edit_distance=2).
      If no suggestion is found the original token is kept.
    - Preserves original capitalisation.
    - Falls back to returning text unchanged if SymSpell is unavailable.
    """
    if not text:
        return text

    sym = _load_symspell()
    if sym is None:
        return text

    try:
        from symspellpy import Verbosity

        tokens = re.split(r"(\W+)", text)
        out = []

        for token in tokens:
            if not token.isalpha() or len(token) <= 3 or _is_whitelisted(token):
                out.append(token)
                continue

            suggestions = sym.lookup(
                token.lower(),
                Verbosity.CLOSEST,
                max_edit_distance=2,
                include_unknown=False,
            )

            if suggestions and suggestions[0].term != token.lower():
                replacement = suggestions[0].term
                if token[0].isupper():
                    replacement = replacement.capitalize()
                out.append(replacement)
            else:
                out.append(token)

        return "".join(out)

    except Exception as exc:
        print(f"[SpellCorrector] Runtime error: {exc}. Returning original.")
        return text
