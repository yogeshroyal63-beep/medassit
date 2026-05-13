# -----------------------------------------------
# Medicine Database — 80+ Common Medicines
# -----------------------------------------------

MEDICINE_DB = {

    # --- Analgesics / Pain Relief ---
    "paracetamol": {
        "uses": "Fever reduction and mild to moderate pain relief",
        "class": "Analgesic / Antipyretic",
        "common_dosage": "500mg-1000mg every 4-6 hours (max 4g/day)",
        "side_effects": "Rare at normal doses. Overdose can cause liver damage.",
        "warning": "Do not exceed recommended dose. Avoid with alcohol."
    },
    "ibuprofen": {
        "uses": "Pain relief, inflammation reduction, and fever",
        "class": "NSAID",
        "common_dosage": "200mg-400mg every 4-6 hours with food",
        "side_effects": "Stomach upset, nausea, increased bleeding risk",
        "warning": "Avoid on empty stomach. Not for kidney disease patients."
    },
    "aspirin": {
        "uses": "Pain relief, fever, inflammation, blood clot prevention",
        "class": "NSAID / Antiplatelet",
        "common_dosage": "325mg-650mg every 4-6 hours for pain",
        "side_effects": "Stomach irritation, bleeding risk",
        "warning": "Do not give to children under 16. Avoid with blood thinners."
    },
    "diclofenac": {
        "uses": "Arthritis pain, muscle pain, inflammation",
        "class": "NSAID",
        "common_dosage": "50mg two to three times daily with food",
        "side_effects": "Stomach pain, nausea, liver issues with long use",
        "warning": "Take with food. Not for long-term use without medical supervision."
    },
    "tramadol": {
        "uses": "Moderate to severe pain relief",
        "class": "Opioid Analgesic",
        "common_dosage": "50mg-100mg every 4-6 hours as needed",
        "side_effects": "Dizziness, nausea, constipation, drowsiness",
        "warning": "Can be habit forming. Do not drive after taking."
    },

    # --- Fever / Cold ---
    "crocin": {
        "uses": "Fever and mild pain (brand of paracetamol)",
        "class": "Analgesic / Antipyretic",
        "common_dosage": "650mg every 6 hours for adults",
        "side_effects": "Generally well tolerated",
        "warning": "Do not take with other paracetamol-containing medicines."
    },
    "dolo": {
        "uses": "Fever and body pain (paracetamol 650mg)",
        "class": "Analgesic / Antipyretic",
        "common_dosage": "1 tablet every 6-8 hours",
        "side_effects": "Rare at normal doses",
        "warning": "Max 3 tablets per day."
    },
    "combiflam": {
        "uses": "Pain, fever, and inflammation",
        "class": "NSAID combination (Ibuprofen + Paracetamol)",
        "common_dosage": "1 tablet every 6-8 hours with food",
        "side_effects": "Stomach upset, nausea",
        "warning": "Take with food. Avoid in kidney disease."
    },

    # --- Antibiotics ---
    "amoxicillin": {
        "uses": "Bacterial infections — throat, ear, chest, urinary tract",
        "class": "Antibiotic (Penicillin)",
        "common_dosage": "250mg-500mg three times daily for 5-7 days",
        "side_effects": "Diarrhea, nausea, allergic reaction",
        "warning": "Complete full course. Check for penicillin allergy first."
    },
    "azithromycin": {
        "uses": "Respiratory infections, skin infections, STIs",
        "class": "Antibiotic (Macrolide)",
        "common_dosage": "500mg on day 1, then 250mg daily for 4 days",
        "side_effects": "Nausea, diarrhea, stomach pain",
        "warning": "Take on empty stomach. Complete full course."
    },
    "ciprofloxacin": {
        "uses": "Urinary tract infections, bacterial diarrhea, typhoid",
        "class": "Antibiotic (Fluoroquinolone)",
        "common_dosage": "250mg-500mg twice daily for 3-14 days",
        "side_effects": "Nausea, diarrhea, tendon problems",
        "warning": "Avoid dairy products with this medicine. Stay hydrated."
    },
    "metronidazole": {
        "uses": "Bacterial and protozoal infections, dental infections",
        "class": "Antibiotic / Antiprotozoal",
        "common_dosage": "400mg three times daily for 5-7 days",
        "side_effects": "Nausea, metallic taste, dizziness",
        "warning": "Absolutely avoid alcohol during treatment."
    },
    "doxycycline": {
        "uses": "Chest infections, malaria prevention, Lyme disease",
        "class": "Antibiotic (Tetracycline)",
        "common_dosage": "100mg twice daily",
        "side_effects": "Photosensitivity, nausea, esophageal irritation",
        "warning": "Take with food and water. Avoid sun exposure."
    },

    # --- Antacids / Digestive ---
    "omeprazole": {
        "uses": "Acid reflux, stomach ulcers, GERD",
        "class": "Proton Pump Inhibitor",
        "common_dosage": "20mg once daily before breakfast",
        "side_effects": "Headache, diarrhea, nausea",
        "warning": "Not for long-term use without medical advice."
    },
    "pantoprazole": {
        "uses": "Acid reflux, peptic ulcers, stomach burning",
        "class": "Proton Pump Inhibitor",
        "common_dosage": "40mg once daily before meal",
        "side_effects": "Headache, diarrhea, stomach pain",
        "warning": "Avoid prolonged use without supervision."
    },
    "ranitidine": {
        "uses": "Stomach acid reduction, ulcers, heartburn",
        "class": "H2 Blocker",
        "common_dosage": "150mg twice daily",
        "side_effects": "Headache, constipation, diarrhea",
        "warning": "Consult doctor before use if on other medications."
    },
    "antacid": {
        "uses": "Immediate heartburn and acidity relief",
        "class": "Antacid",
        "common_dosage": "1-2 tablets or 10ml after meals and at bedtime",
        "side_effects": "Constipation or diarrhea depending on type",
        "warning": "Do not take within 2 hours of other medicines."
    },
    "domperidone": {
        "uses": "Nausea, vomiting, slow gastric emptying",
        "class": "Antiemetic / Prokinetic",
        "common_dosage": "10mg three times daily before meals",
        "side_effects": "Dry mouth, headache, diarrhea",
        "warning": "Not for long-term use. Consult doctor if symptoms persist."
    },
    "ondansetron": {
        "uses": "Nausea and vomiting (especially after chemotherapy)",
        "class": "Antiemetic",
        "common_dosage": "4mg-8mg every 8 hours as needed",
        "side_effects": "Headache, constipation, dizziness",
        "warning": "Consult doctor before use."
    },

    # --- Antihistamines / Allergy ---
    "cetirizine": {
        "uses": "Allergic rhinitis, hives, itching, sneezing",
        "class": "Antihistamine",
        "common_dosage": "10mg once daily",
        "side_effects": "Drowsiness, dry mouth, headache",
        "warning": "Avoid driving if drowsy. Avoid alcohol."
    },
    "loratadine": {
        "uses": "Allergies, hay fever, hives — non-drowsy",
        "class": "Antihistamine (Non-sedating)",
        "common_dosage": "10mg once daily",
        "side_effects": "Headache, dry mouth — less drowsy than other antihistamines",
        "warning": "Generally safe for daytime use."
    },
    "fexofenadine": {
        "uses": "Seasonal allergies, hives",
        "class": "Antihistamine (Non-sedating)",
        "common_dosage": "120mg-180mg once daily",
        "side_effects": "Headache, nausea",
        "warning": "Avoid with fruit juice as it reduces absorption."
    },
    "chlorphenamine": {
        "uses": "Allergies, hay fever, cold symptoms, itching",
        "class": "Antihistamine",
        "common_dosage": "4mg every 4-6 hours",
        "side_effects": "Drowsiness, dry mouth, blurred vision",
        "warning": "Causes drowsiness. Do not drive."
    },

    # --- Respiratory ---
    "salbutamol": {
        "uses": "Asthma, bronchospasm relief (reliever inhaler)",
        "class": "Bronchodilator",
        "common_dosage": "1-2 puffs every 4-6 hours as needed",
        "side_effects": "Tremor, rapid heartbeat, headache",
        "warning": "If using more than 3 times/week, see a doctor."
    },
    "budesonide": {
        "uses": "Asthma prevention, chronic lung disease",
        "class": "Corticosteroid (Inhaler)",
        "common_dosage": "200-400mcg twice daily",
        "side_effects": "Oral thrush, hoarse voice",
        "warning": "Rinse mouth after each use. Not a reliever inhaler."
    },
    "montelukast": {
        "uses": "Asthma prevention, allergic rhinitis",
        "class": "Leukotriene Receptor Antagonist",
        "common_dosage": "10mg once daily in the evening",
        "side_effects": "Headache, stomach pain, mood changes",
        "warning": "Report any mood or behaviour changes to doctor."
    },

    # --- Cardiovascular ---
    "amlodipine": {
        "uses": "High blood pressure, chest pain (angina)",
        "class": "Calcium Channel Blocker",
        "common_dosage": "5mg-10mg once daily",
        "side_effects": "Ankle swelling, flushing, headache",
        "warning": "Do not stop suddenly. Regular BP monitoring required."
    },
    "atenolol": {
        "uses": "High blood pressure, angina, irregular heartbeat",
        "class": "Beta Blocker",
        "common_dosage": "25mg-100mg once daily",
        "side_effects": "Cold hands, fatigue, slow heartbeat",
        "warning": "Never stop suddenly — taper under doctor supervision."
    },
    "lisinopril": {
        "uses": "High blood pressure, heart failure, kidney protection in diabetes",
        "class": "ACE Inhibitor",
        "common_dosage": "5mg-40mg once daily",
        "side_effects": "Dry cough, dizziness, elevated potassium",
        "warning": "Report persistent dry cough to doctor."
    },
    "clopidogrel": {
        "uses": "Blood clot prevention after heart attack or stroke",
        "class": "Antiplatelet",
        "common_dosage": "75mg once daily",
        "side_effects": "Bleeding, bruising, stomach upset",
        "warning": "Inform surgeon/dentist before any procedure."
    },
    "atorvastatin": {
        "uses": "High cholesterol, heart disease prevention",
        "class": "Statin",
        "common_dosage": "10mg-80mg once daily at night",
        "side_effects": "Muscle pain, liver enzyme changes",
        "warning": "Report unexplained muscle pain immediately."
    },

    # --- Diabetes ---
    "metformin": {
        "uses": "Type 2 diabetes blood sugar control",
        "class": "Biguanide / Antidiabetic",
        "common_dosage": "500mg-1000mg twice daily with meals",
        "side_effects": "Nausea, diarrhea, stomach upset initially",
        "warning": "Take with food. Avoid in kidney disease."
    },
    "glimepiride": {
        "uses": "Type 2 diabetes",
        "class": "Sulfonylurea / Antidiabetic",
        "common_dosage": "1mg-4mg once daily before breakfast",
        "side_effects": "Low blood sugar, weight gain",
        "warning": "Monitor blood sugar regularly."
    },
    "insulin": {
        "uses": "Type 1 and Type 2 diabetes blood sugar control",
        "class": "Hormone / Antidiabetic",
        "common_dosage": "As prescribed by doctor — varies by type",
        "side_effects": "Low blood sugar, injection site reactions",
        "warning": "Never change dose without doctor guidance."
    },

    # --- Thyroid ---
    "levothyroxine": {
        "uses": "Hypothyroidism (underactive thyroid)",
        "class": "Thyroid Hormone",
        "common_dosage": "25mcg-200mcg once daily on empty stomach",
        "side_effects": "Palpitations, insomnia, weight loss if overdosed",
        "warning": "Take on empty stomach 30 mins before food."
    },

    # --- Antimalarials ---
    "chloroquine": {
        "uses": "Malaria prevention and treatment",
        "class": "Antimalarial",
        "common_dosage": "As per doctor prescription",
        "side_effects": "Nausea, headache, vision changes with long use",
        "warning": "Regular eye checks needed with long-term use."
    },
    "artemether": {
        "uses": "Malaria treatment",
        "class": "Antimalarial",
        "common_dosage": "As per doctor prescription",
        "side_effects": "Dizziness, nausea, joint pain",
        "warning": "Complete full course as prescribed."
    },

    # --- Vitamins / Supplements ---
    "vitamin_c": {
        "uses": "Immune support, scurvy prevention, antioxidant",
        "class": "Vitamin / Supplement",
        "common_dosage": "500mg-1000mg daily",
        "side_effects": "Stomach upset at high doses",
        "warning": "High doses may cause kidney stones in susceptible people."
    },
    "vitamin_d": {
        "uses": "Bone health, immune function, calcium absorption",
        "class": "Vitamin / Supplement",
        "common_dosage": "1000-2000 IU daily",
        "side_effects": "Toxicity at very high doses",
        "warning": "Get blood levels checked before high dose supplementation."
    },
    "iron": {
        "uses": "Iron deficiency anemia",
        "class": "Mineral Supplement",
        "common_dosage": "60mg-200mg daily",
        "side_effects": "Constipation, dark stools, stomach upset",
        "warning": "Take on empty stomach for best absorption. Avoid with dairy."
    },
    "zinc": {
        "uses": "Immune support, wound healing, cold symptom reduction",
        "class": "Mineral Supplement",
        "common_dosage": "15mg-30mg daily",
        "side_effects": "Nausea at high doses",
        "warning": "Do not exceed 40mg daily."
    },

    # --- Others ---
    "prednisolone": {
        "uses": "Inflammation, allergic reactions, asthma, autoimmune conditions",
        "class": "Corticosteroid",
        "common_dosage": "As prescribed — varies widely",
        "side_effects": "Weight gain, mood changes, blood sugar rise, immune suppression",
        "warning": "Never stop suddenly. Long-term use requires medical supervision."
    },
    "lorazepam": {
        "uses": "Anxiety, seizures, insomnia",
        "class": "Benzodiazepine",
        "common_dosage": "0.5mg-2mg as prescribed",
        "side_effects": "Drowsiness, confusion, dependence",
        "warning": "Can be habit forming. Never take with alcohol."
    },
    "fluoxetine": {
        "uses": "Depression, anxiety, OCD, panic disorder",
        "class": "SSRI Antidepressant",
        "common_dosage": "20mg-60mg once daily",
        "side_effects": "Nausea, insomnia, sexual dysfunction",
        "warning": "Takes 2-4 weeks to work. Do not stop suddenly."
    },
    "sertraline": {
        "uses": "Depression, anxiety, PTSD, OCD",
        "class": "SSRI Antidepressant",
        "common_dosage": "50mg-200mg once daily",
        "side_effects": "Nausea, insomnia, diarrhea",
        "warning": "Takes weeks to show full effect. Do not stop abruptly."
    },
    "pantop": {
        "uses": "Acid reflux and stomach ulcers (pantoprazole brand)",
        "class": "Proton Pump Inhibitor",
        "common_dosage": "40mg before breakfast",
        "side_effects": "Headache, diarrhea",
        "warning": "Avoid prolonged use without doctor advice."
    },
    "ors": {
        "uses": "Rehydration in diarrhea and dehydration",
        "class": "Oral Rehydration Solution",
        "common_dosage": "1 sachet in 1 litre of water — drink as needed",
        "side_effects": "Generally safe",
        "warning": "Use clean water to prepare. Discard unused solution after 24 hours."
    },
}

# -----------------------------------------------
# Medicine keyword aliases
# -----------------------------------------------

MEDICINE_ALIASES = {
    "crocin":        "paracetamol",
    "dolo":          "paracetamol",
    "tylenol":       "paracetamol",
    "advil":         "ibuprofen",
    "brufen":        "ibuprofen",
    "disprin":       "aspirin",
    "voltaren":      "diclofenac",
    "zithromax":     "azithromycin",
    "cipro":         "ciprofloxacin",
    "flagyl":        "metronidazole",
    "prilosec":      "omeprazole",
    "nexium":        "omeprazole",
    "zyrtec":        "cetirizine",
    "claritin":      "loratadine",
    "ventolin":      "salbutamol",
    "glucophage":    "metformin",
    "synthroid":     "levothyroxine",
    "prozac":        "fluoxetine",
    "zoloft":        "sertraline",
    "vitamin c":     "vitamin_c",
    "vitamin d":     "vitamin_d",
    "electrolyte":   "ors",
    "rehydration":   "ors",
}


def handle_medicine_query(text):
    """
    Look up medicine information from the database.
    Handles aliases and returns structured information.
    """
    text_lower = text.lower()

    # Check aliases first
    for alias, real_name in MEDICINE_ALIASES.items():
        if alias in text_lower:
            text_lower = text_lower.replace(alias, real_name)

    # Search medicine DB
    for med_name, med_info in MEDICINE_DB.items():
        if med_name.replace("_", " ") in text_lower or med_name in text_lower:
            return {
                "medicine":       med_name.replace("_", " ").title(),
                "uses":           med_info["uses"],
                "class":          med_info["class"],
                "common_dosage":  med_info["common_dosage"],
                "side_effects":   med_info["side_effects"],
                "warning":        med_info["warning"],
                "disclaimer":     "Always consult a healthcare professional before taking any medication."
            }

    return {
        "message":    "Medicine not found in our database.",
        "suggestion": "Please consult a pharmacist or doctor for information about this medicine.",
        "disclaimer": "Do not take any medicine without proper medical advice."
    }


def search_medicines(query):
    """
    Search medicines by partial name match.
    FIXED: normalize both the query and the medicine key by replacing underscores
    with spaces before comparing, so 'vitamin c' correctly matches 'vitamin_c'.
    """
    query_normalized = query.lower().replace("_", " ")
    results = []
    for med_name in MEDICINE_DB:
        med_normalized = med_name.replace("_", " ")
        if query_normalized in med_normalized:
            results.append(med_name.replace("_", " ").title())
    return results
