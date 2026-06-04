import csv
import random
import os
from itertools import combinations

OUTPUT_FILE = "dataset/triage_dataset.csv"
TARGET_SIZE = 1_000_000

# -----------------------------------------------
# 60 CONDITIONS — 12-14 symptoms each
# -----------------------------------------------

CONDITIONS = {

    # ── Low severity ────────────────────────────────────────────────────────

    "CommonCold": [
        "runny nose", "sneezing", "mild cough", "sore throat",
        "nasal congestion", "watery eyes", "mild headache", "low grade fever",
        "stuffy nose", "throat irritation", "mild fatigue", "loss of taste",
    ],

    "Allergy": [
        "sneezing", "itchy eyes", "runny nose", "skin rash",
        "hives", "itchy throat", "watery eyes", "nasal congestion",
        "wheezing", "red eyes", "itchy skin", "swollen lips",
    ],

    "MuscleStrain": [
        "muscle pain", "localized swelling", "limited movement",
        "tenderness to touch", "bruising", "muscle spasm",
        "stiffness", "muscle weakness", "aching soreness",
        "pain on movement", "tightness", "cramping",
    ],

    "TensionHeadache": [
        "dull headache", "neck pain", "pressure in head",
        "scalp tenderness", "shoulder tension", "forehead pressure",
        "band like head pain", "mild nausea", "eye strain",
        "jaw tightness", "head heaviness", "concentration difficulty",
    ],

    "Eczema": [
        "dry skin", "intense itching", "red skin patches",
        "skin inflammation", "skin cracking", "scaly rash",
        "swollen skin", "oozing blisters", "skin thickening",
        "raw sensitive skin", "skin discoloration", "recurring rash",
    ],

    "Conjunctivitis": [
        "red eyes", "itchy eyes", "eye discharge",
        "watery eyes", "swollen eyelids", "crusty eyelids",
        "burning eyes", "light sensitivity", "blurred vision",
        "gritty eye sensation", "sticky eyes", "eye redness",
    ],

    "Gout": [
        "sudden joint pain", "swollen joint", "joint redness",
        "joint warmth", "joint tenderness", "limited joint movement",
        "intense pain at night", "ankle pain", "big toe pain",
        "shiny swollen skin", "joint stiffness", "throbbing joint pain",
    ],

    "SkinInfection": [
        "skin redness", "localized swelling", "skin pain",
        "pus discharge", "skin warmth", "fever",
        "skin ulcer", "fluid discharge", "itching with redness",
        "skin crusting", "abscess", "spreading redness",
    ],

    "Hemorrhoids": [
        "rectal bleeding", "anal pain", "itching around anus",
        "discomfort during bowel movement", "swelling around anus",
        "mucus discharge", "feeling of incomplete bowel emptying",
        "bright red blood on stool", "pain when sitting", "anal irritation",
        "lump near anus", "straining during bowel movement",
    ],

    "MouthUlcer": [
        "painful mouth sore", "difficulty eating", "difficulty swallowing",
        "sore inside cheek", "white patch in mouth", "mouth irritation",
        "swollen gum", "burning mouth sensation", "ulcer on tongue",
        "bleeding gums", "mouth pain", "sensitivity to spicy food",
    ],

    "PinkEye": [
        "pink or red eye", "eye discharge", "eye irritation",
        "watery eyes", "swollen eyelids", "crusty eyes in morning",
        "itchy eyes", "light sensitivity", "blurred vision",
        "gritty sensation in eye", "eye redness", "burning eyes",
    ],

    "Ringworm": [
        "circular skin rash", "itchy ring shaped rash", "scaly skin",
        "red border rash", "skin peeling", "bald patches on scalp",
        "nail discoloration", "itchy scalp", "spreading ring rash",
        "skin discoloration", "brittle nails", "athlete foot",
    ],

    # ── Moderate severity ────────────────────────────────────────────────────

    "Flu": [
        "high fever", "persistent cough", "sore throat", "body aches",
        "severe fatigue", "chills and sweating", "headache", "runny nose",
        "muscle pain", "loss of appetite", "weakness", "nasal congestion",
    ],

    "ViralFever": [
        "high fever", "body pain", "severe fatigue",
        "weakness", "headache", "chills",
        "loss of appetite", "night sweats", "sore throat",
        "joint pain", "shivering", "red eyes",
    ],

    "Migraine": [
        "severe one sided headache", "light sensitivity", "nausea",
        "vomiting", "sound sensitivity", "throbbing head pain",
        "vision disturbance", "aura", "neck stiffness",
        "dizziness", "facial pain", "smell sensitivity",
    ],

    "FoodPoisoning": [
        "vomiting", "diarrhea", "stomach cramps", "nausea",
        "fever", "abdominal pain", "weakness", "dehydration",
        "loss of appetite", "sweating", "dizziness", "bloating",
    ],

    "UrinaryInfection": [
        "burning urination", "frequent urination",
        "pelvic pain", "cloudy urine", "strong urine odor",
        "blood in urine", "lower back pain", "low grade fever",
        "urge to urinate", "incomplete bladder emptying",
        "painful urination", "lower abdominal pain",
    ],

    "Vertigo": [
        "spinning sensation", "dizziness", "balance problems",
        "nausea", "vomiting", "ear ringing",
        "hearing loss", "abnormal eye movements", "unsteady walking",
        "feeling of tilting", "lightheadedness", "head motion sensitivity",
    ],

    "Dehydration": [
        "extreme thirst", "dry mouth", "dizziness", "fatigue",
        "dark yellow urine", "dry skin", "headache",
        "rapid heartbeat", "muscle cramps", "sunken eyes",
        "decreased urination", "confusion",
    ],

    "AnxietyAttack": [
        "racing heartbeat", "shortness of breath", "excessive worry",
        "sweating", "trembling hands", "chest tightness",
        "nausea", "dizziness", "feeling of impending doom",
        "restlessness", "inability to concentrate", "irritability",
    ],

    "PanicAttack": [
        "intense fear", "rapid heartbeat", "chest pain",
        "dizziness", "trembling", "numbness or tingling",
        "shortness of breath", "choking sensation", "hot flashes",
        "chills", "sweating", "feeling of unreality",
    ],

    "Sinusitis": [
        "facial pain", "nasal congestion", "headache",
        "thick nasal discharge", "reduced sense of smell",
        "cough", "ear pressure", "fever", "bad breath",
        "tooth pain", "facial swelling", "post nasal drip",
    ],

    "Bronchitis": [
        "persistent cough", "mucus production", "chest discomfort",
        "fatigue", "mild fever", "shortness of breath",
        "wheezing", "sore throat", "chest soreness",
        "runny nose", "body aches", "cough worse at night",
    ],

    "Gastritis": [
        "stomach burning", "upper abdominal pain", "nausea",
        "bloating", "indigestion", "loss of appetite",
        "hiccups", "dark stools", "vomiting",
        "feeling full quickly", "belching", "stomach tenderness",
    ],

    "PepticUlcer": [
        "burning stomach pain", "nausea", "vomiting",
        "dark stools", "blood in vomit", "unintended weight loss",
        "loss of appetite", "bloating", "pain when hungry",
        "pain relieved by eating", "belching", "acid reflux",
    ],

    "Depression": [
        "persistent sadness", "loss of interest in activities", "fatigue",
        "sleep disturbances", "appetite changes", "difficulty concentrating",
        "feelings of worthlessness", "social withdrawal", "hopelessness",
        "low energy", "irritability", "slowed thinking",
    ],

    "ThyroidDisorder": [
        "unexplained fatigue", "weight changes", "cold intolerance",
        "hair loss", "dry skin", "constipation",
        "slow heartbeat", "depressed mood", "muscle weakness",
        "puffiness around eyes", "hoarse voice", "memory problems",
    ],

    "DiabetesSymptoms": [
        "frequent urination", "excessive thirst", "unexplained fatigue",
        "blurred vision", "slow healing wounds", "unexplained weight loss",
        "tingling in feet", "frequent infections", "constant hunger",
        "dry mouth", "fruity breath", "numbness in hands",
    ],

    "Chickenpox": [
        "itchy fluid filled blisters", "red skin rash", "fever",
        "fatigue", "loss of appetite", "headache",
        "blister scabbing", "sore throat", "stomach ache",
        "spreading blisters", "irritability", "mild cough",
    ],

    "Dengue": [
        "sudden high fever", "severe headache", "pain behind eyes",
        "joint pain", "muscle pain", "skin rash",
        "mild bleeding", "nausea", "vomiting", "fatigue",
        "low platelet count signs", "abdominal pain",
    ],

    "Typhoid": [
        "prolonged high fever", "weakness", "abdominal pain",
        "headache", "loss of appetite", "constipation",
        "rose spots on chest", "diarrhea", "dry cough",
        "sweating", "enlarged spleen", "confusion",
    ],

    "Malaria": [
        "cyclical fever", "chills", "profuse sweating",
        "headache", "nausea", "vomiting",
        "muscle pain", "fatigue", "anemia symptoms",
        "shivering episodes", "jaundice", "enlarged spleen",
    ],

    "GERD": [
        "heartburn", "acid reflux", "chest burning",
        "sour taste in mouth", "difficulty swallowing", "regurgitation",
        "chronic cough", "hoarse voice", "belching",
        "upper abdominal discomfort", "nausea after eating", "throat irritation",
    ],

    "IrritableBowel": [
        "abdominal cramping", "bloating", "alternating diarrhea and constipation",
        "mucus in stool", "gas", "abdominal pain relieved by bowel movement",
        "urgency to defecate", "feeling of incomplete emptying",
        "nausea", "food intolerance", "abdominal distension", "fatigue",
    ],

    "Psoriasis": [
        "thick red skin patches", "silvery scales on skin", "dry cracked skin",
        "skin itching", "burning skin", "joint pain",
        "thickened nails", "pitted nails", "scalp rash",
        "skin bleeding on scratching", "stiff joints", "skin soreness",
    ],

    "SleepDisorder": [
        "difficulty falling asleep", "waking up frequently at night", "daytime sleepiness",
        "loud snoring", "gasping during sleep", "morning headache",
        "difficulty concentrating", "irritability", "restless legs at night",
        "nightmares", "sleepwalking", "non restorative sleep",
    ],

    "CervicalSpondylosis": [
        "neck pain", "neck stiffness", "arm pain",
        "numbness in arms", "tingling in fingers", "headache at back of head",
        "grinding sensation in neck", "shoulder pain", "weakness in arms",
        "loss of balance", "difficulty walking", "neck clicking sound",
    ],

    "Sciatica": [
        "lower back pain", "shooting leg pain", "pain along back of leg",
        "numbness in leg", "tingling in leg", "weakness in leg",
        "pain worsened by sitting", "burning sensation down leg",
        "hip pain", "difficulty standing", "one sided leg pain", "foot numbness",
    ],

    "Tonsillitis": [
        "sore throat", "swollen tonsils", "difficulty swallowing",
        "fever", "bad breath", "swollen neck glands",
        "white patches on tonsils", "muffled voice", "ear pain",
        "headache", "drooling", "loss of appetite",
    ],

    "OtitisMedia": [
        "ear pain", "ear discharge", "hearing difficulty",
        "fever", "irritability", "tugging at ear",
        "difficulty sleeping", "loss of balance", "ear fullness",
        "headache", "reduced hearing", "fluid in ear",
    ],

    # ── High severity ────────────────────────────────────────────────────────

    "Asthma": [
        "wheezing", "shortness of breath", "chest tightness",
        "breathing difficulty", "nighttime coughing", "difficulty exhaling",
        "rapid breathing", "blue lips", "breathlessness on exertion",
        "frequent coughing", "anxiety with breathlessness", "noisy breathing",
    ],

    "Pneumonia": [
        "high fever with chills", "chest pain on breathing", "cough with mucus",
        "difficulty breathing", "rapid breathing", "fatigue",
        "bluish lips or nails", "sweating", "confusion",
        "coughing blood", "low oxygen symptoms", "loss of appetite",
    ],

    "Hypertension": [
        "severe headache", "chest pain", "dizziness",
        "shortness of breath", "blurred vision",
        "nosebleed", "fatigue", "irregular heartbeat",
        "pounding in chest", "blood in urine", "facial flushing", "neck pain",
    ],

    "Anemia": [
        "extreme fatigue", "pale skin", "shortness of breath",
        "weakness", "dizziness", "cold hands and feet",
        "headache", "chest pain", "brittle nails",
        "fast heartbeat", "poor concentration", "leg cramps",
    ],

    "FractureRisk": [
        "severe bone pain", "visible swelling", "limb deformity",
        "inability to move limb", "bruising", "bone tenderness",
        "numbness near injury", "bone visible through skin", "grinding bone sensation",
        "severe pain on touch", "inability to bear weight", "joint instability",
    ],

    "KidneyStone": [
        "severe flank pain", "pain during urination",
        "blood in urine", "nausea", "vomiting",
        "frequent urination", "lower abdominal pain",
        "cloudy urine", "fever with chills",
        "pain radiating to groin", "restlessness", "difficulty finding comfortable position",
    ],

    "Appendicitis": [
        "abdominal pain", "nausea", "vomiting",
        "loss of appetite", "low grade fever", "pain near navel moving to lower right",
        "pain in lower right abdomen", "inability to pass gas",
        "abdominal rigidity", "pain worsened by movement",
        "rebound tenderness", "constipation",
    ],

    "GallstoneAttack": [
        "upper right abdomen pain", "nausea", "vomiting",
        "back pain between shoulders", "pain after fatty meal", "fever",
        "jaundice", "indigestion", "bloating",
        "clay colored stools", "dark urine", "pain radiating to right shoulder",
    ],

    "Jaundice": [
        "yellow skin", "yellow eyes", "dark brown urine",
        "pale stools", "upper abdominal pain", "fatigue",
        "skin itching", "nausea", "fever",
        "unintended weight loss", "loss of appetite", "swollen abdomen",
    ],

    "LiverDisease": [
        "abdominal swelling", "swollen abdomen", "yellow skin",
        "fatigue", "nausea", "loss of appetite",
        "dark urine", "pale stools", "skin itching",
        "easy bruising", "spider veins on skin", "muscle wasting",
    ],

    "Tuberculosis": [
        "persistent cough over 3 weeks", "coughing blood", "chest pain",
        "unintended weight loss", "night sweats", "severe fatigue",
        "fever", "loss of appetite", "general weakness",
        "chills", "swollen lymph nodes", "breathlessness",
    ],

    "COVID19": [
        "fever", "dry persistent cough", "loss of smell",
        "extreme fatigue", "shortness of breath", "loss of taste",
        "body aches", "sore throat", "headache",
        "diarrhea", "chills", "difficulty breathing",
    ],

    "DeepVeinThrombosis": [
        "leg swelling", "leg pain", "leg warmth",
        "leg redness", "visible leg veins", "cramping in calf",
        "skin discoloration in leg", "leg heaviness", "ankle swelling",
        "pain worsened by walking", "tight feeling in leg", "leg tenderness",
    ],

    "Pancreatitis": [
        "severe upper abdominal pain", "pain radiating to back", "nausea",
        "vomiting", "fever", "rapid heartbeat",
        "abdominal tenderness", "bloating", "loss of appetite",
        "pain worsened by eating", "oily stools", "unintended weight loss",
    ],

    "CeliacDisease": [
        "diarrhea after eating gluten", "bloating", "abdominal pain",
        "fatigue", "unintended weight loss", "anemia symptoms",
        "bone pain", "skin rash", "mouth ulcers",
        "constipation", "headache", "joint pain",
    ],

    # ── Critical severity ─────────────────────────────────────────────────────

    "HeartAttackRisk": [
        "chest pressure or tightness", "left arm pain", "jaw pain",
        "back pain", "shortness of breath", "cold sweat",
        "nausea", "dizziness", "sudden fatigue",
        "heartburn like pain", "palpitations", "feeling of doom",
    ],

    "SeizureRisk": [
        "convulsions", "loss of consciousness", "uncontrolled muscle jerking",
        "staring spell", "temporary confusion", "sudden falling",
        "lip smacking", "body stiffening", "loss of bladder control",
        "biting tongue", "post seizure confusion", "repetitive movements",
    ],

    "StrokeRisk": [
        "sudden arm weakness", "slurred speech", "facial drooping",
        "sudden vision problems", "sudden severe headache", "loss of balance",
        "sudden confusion", "leg weakness", "face numbness",
        "difficulty speaking", "sudden dizziness", "trouble understanding speech",
    ],

    "Meningitis": [
        "severe headache", "stiff neck", "high fever",
        "extreme sensitivity to light", "nausea", "vomiting",
        "confusion", "skin rash that does not fade", "seizures",
        "drowsiness", "difficulty concentrating", "cold hands and feet",
    ],

    "PneumothoraxRisk": [
        "sudden chest pain", "acute shortness of breath",
        "rapid shallow breathing", "chest tightness",
        "bluish skin color", "rapid heartbeat",
        "decreased breath sounds", "anxiety with breathlessness",
        "shoulder pain", "chest asymmetry", "low blood pressure signs", "fatigue",
    ],

    "SepsisSigns": [
        "very high fever", "chills and shivering", "rapid heartbeat",
        "rapid breathing", "confusion or disorientation", "extreme weakness",
        "low blood pressure signs", "cold clammy skin", "decreased urination",
        "severe pain", "altered mental state", "loss of consciousness",
    ],

    "AnaphalaxisRisk": [
        "throat swelling", "difficulty breathing", "hives all over body",
        "rapid heartbeat", "drop in blood pressure signs", "dizziness",
        "nausea and vomiting", "pale or bluish skin", "loss of consciousness",
        "swollen tongue", "severe skin rash", "anxiety and panic",
    ],

    "DiabeticKetoacidosis": [
        "fruity breath odor", "rapid breathing", "excessive thirst",
        "frequent urination", "nausea and vomiting", "abdominal pain",
        "confusion", "extreme fatigue", "blurred vision",
        "weakness", "dry mouth", "loss of consciousness",
    ],

    "PulmonaryEmbolism": [
        "sudden shortness of breath", "sharp chest pain", "rapid heartbeat",
        "coughing blood", "dizziness", "sweating",
        "leg pain or swelling", "bluish lips", "low blood pressure signs",
        "rapid breathing", "anxiety", "fainting",
    ],

    "AcuteRenalFailure": [
        "severely decreased urination", "swelling in legs and ankles", "fatigue",
        "confusion", "nausea", "shortness of breath",
        "chest pain or pressure", "irregular heartbeat", "back pain",
        "skin rash", "loss of appetite", "metallic taste in mouth",
    ],
}

# -----------------------------------------------
# 60 TEMPLATES — varied natural language
# -----------------------------------------------

TEMPLATES = [
    # Basic 2-symptom
    "{s1} and {s2}",
    "{s1} with {s2}",
    "{s1} along with {s2}",
    "I have {s1} and {s2}",
    "I am experiencing {s1} and {s2}",
    "I feel {s1} and {s2}",
    "suffering from {s1} and {s2}",
    "complaints of {s1} and {s2}",
    "patient has {s1} and {s2}",
    "presenting with {s1} and {s2}",
    "I notice {s1} and {s2}",
    "having {s1} and {s2}",
    "woke up with {s1} and {s2}",
    "doctor I have {s1} and {s2}",
    "not feeling well, {s1} and {s2}",

    # 3-symptom
    "{s1}, {s2} and {s3}",
    "I have {s1}, {s2} and {s3}",
    "I am experiencing {s1} with {s2} and {s3}",
    "I feel {s1}, {s2} and also {s3}",
    "{s1} and {s2} with {s3}",
    "I am having {s1} along with {s2} and {s3}",
    "symptoms include {s1}, {s2} and {s3}",
    "suffering with {s1}, {s2} and {s3}",
    "patient presents with {s1}, {s2} and {s3}",
    "complaints of {s1}, {s2} and {s3}",

    # 4-symptom
    "{s1}, {s2}, {s3} and {s4}",
    "I have {s1}, {s2}, {s3} and {s4}",
    "experiencing {s1}, {s2}, {s3} and {s4}",
    "symptoms are {s1}, {s2}, {s3} and {s4}",
    "I am suffering from {s1}, {s2}, {s3} and {s4}",

    # Duration variants
    "I have been having {s1} and {s2} for {duration}",
    "{s1} and {s2} since {duration}",
    "for the last {duration} I have {s1} and {s2}",
    "started having {s1} and {s2} since {duration}",
    "having {s1} and {s2} on and off for {duration}",
    "please help, I have {s1} and {s2} since {duration}",
    "feeling {s1} with {s2} for {duration}",
    "I have had {s1}, {s2} and {s3} for {duration}",
    "{s1}, {s2} and {s3} for the past {duration}",
    "since {duration} I have been experiencing {s1} and {s2}",

    # Context variants
    "my child has {s1} and {s2}",
    "my elderly parent has {s1} and {s2}",
    "I am diabetic and I have {s1} and {s2}",
    "I am pregnant and experiencing {s1} and {s2}",
    "I am hypertensive and I have {s1} and {s2}",
    "{s1} and {s2} are getting worse",
    "{s1} and {s2} started suddenly",
    "{s1} followed by {s2}",
    "sudden onset of {s1} and {s2}",
    "I woke up suddenly with {s1} and {s2}",

    # Question / help seeking
    "what could cause {s1} and {s2}",
    "help me, I have {s1} and {s2}",
    "should I be worried about {s1} and {s2}",
    "is it serious if I have {s1} and {s2}",
    "I keep getting {s1} and {s2}",
    "recurring {s1} and {s2}",
    "{s1} and {s2} that will not go away",
    "severe {s1} with {s2}",
    "mild {s1} with {s2}",
    "sudden {s1} and {s2}",
]

DURATIONS = [
    "2 days", "3 days", "a week", "since morning",
    "since yesterday", "4 days", "5 days", "10 days",
    "2 weeks", "3 weeks", "a month", "few hours",
    "this morning", "last night", "past 2 days",
    "about a day", "three days", "several days",
]

# -----------------------------------------------
# MISSPELLINGS — realistic user typos
# -----------------------------------------------

MISSPELLINGS = {
    "fever":       ["fevr", "feever", "fver", "feveer", "feber"],
    "cough":       ["couhg", "cof", "cogh", "cugh", "caugh"],
    "headache":    ["hedache", "headche", "headach", "headeche"],
    "breathing":   ["brething", "breathng", "breatihng", "breatheing"],
    "vomiting":    ["vomting", "vomitin", "vomitng", "vommiting"],
    "diarrhea":    ["diarrea", "diarrhoea", "diarrhia", "diarhea"],
    "nausea":      ["nasea", "nausae", "nausia", "nawsea"],
    "fatigue":     ["fatiuge", "fatige", "fatgue", "fateague"],
    "dizziness":   ["dizznes", "dizzines", "diziness", "dizzness"],
    "swelling":    ["sweling", "sweeling", "swellng", "swolen"],
    "itching":     ["itchng", "itchhing", "itcing", "ichting"],
    "weakness":    ["weaknes", "weekness", "weaknss", "weeknes"],
    "bleeding":    ["bleding", "bleednig", "bleedng", "bleading"],
    "burning":     ["burnng", "burining", "burnig", "burnning"],
    "urination":   ["urinaton", "urinaion", "urintion", "urinnation"],
    "abdominal":   ["abdomnal", "abdominel", "abdomenal"],
    "shortness":   ["shorness", "shortnes", "shortnes"],
    "pressure":    ["presure", "pressur", "presssure"],
    "discharge":   ["discarge", "discharg", "discharje"],
    "sensitivity": ["sensitivty", "sensitiviy", "sensitvity"],
}


def apply_noise(text):
    words = text.split()
    for i, w in enumerate(words):
        if w in MISSPELLINGS and random.random() < 0.07:
            words[i] = random.choice(MISSPELLINGS[w])
    return " ".join(words)


def fill_template(template, symptoms):
    """Fill a template with symptoms, gracefully handling missing slots."""
    s = symptoms + symptoms  # pad so we never run out
    try:
        return template.format(
            s1=s[0], s2=s[1], s3=s[2], s4=s[3],
            duration=random.choice(DURATIONS),
        )
    except (IndexError, KeyError):
        return f"I have {s[0]} and {s[1]}"


def generate_samples():
    """
    Generate unique samples via 2-, 3-, and 4-symptom combinations
    across all 60 conditions and all 60 templates.
    Returns a generator to keep memory low.
    """
    seen = set()

    for condition, symptom_list in CONDITIONS.items():
        # 2-symptom combos
        for combo in combinations(symptom_list, 2):
            for template in TEMPLATES:
                text = fill_template(template, list(combo))
                text = apply_noise(text)
                key = (text, condition)
                if key not in seen:
                    seen.add(key)
                    yield (text, condition)

        # 3-symptom combos
        for combo in combinations(symptom_list, 3):
            for template in TEMPLATES:
                text = fill_template(template, list(combo))
                text = apply_noise(text)
                key = (text, condition)
                if key not in seen:
                    seen.add(key)
                    yield (text, condition)

        # 4-symptom combos
        for combo in combinations(symptom_list, 4):
            for template in TEMPLATES:
                text = fill_template(template, list(combo))
                text = apply_noise(text)
                key = (text, condition)
                if key not in seen:
                    seen.add(key)
                    yield (text, condition)


def main():
    os.makedirs("dataset", exist_ok=True)

    print(f"Conditions: {len(CONDITIONS)}")
    print(f"Templates:  {len(TEMPLATES)}")
    print(f"Target:     {TARGET_SIZE:,} unique samples")
    print("Generating...\n")

    written = 0
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])

        buffer = []
        BUFFER_SIZE = 50_000

        for text, label in generate_samples():
            if written >= TARGET_SIZE:
                break
            buffer.append((text, label))
            if len(buffer) >= BUFFER_SIZE:
                random.shuffle(buffer)
                writer.writerows(buffer)
                written += len(buffer)
                buffer = []
                print(f"  Written: {written:,} / {TARGET_SIZE:,}", end="\r")

        # flush remainder
        if buffer and written < TARGET_SIZE:
            remaining = TARGET_SIZE - written
            buffer = buffer[:remaining]
            random.shuffle(buffer)
            writer.writerows(buffer)
            written += len(buffer)

    print(f"\n\n{'='*50}")
    print(f"Dataset complete!")
    print(f"Total samples written : {written:,}")
    print(f"Total conditions      : {len(CONDITIONS)}")
    print(f"Output file           : {OUTPUT_FILE}")
    print(f"{'='*50}")
    print("Conditions:", list(CONDITIONS.keys()))


if __name__ == "__main__":
    main()
