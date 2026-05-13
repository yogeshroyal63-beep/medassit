# -----------------------------------------------
# Emergency Rules — 40+ Keywords + Combinations
# -----------------------------------------------

# Single keyword emergencies
EMERGENCY_KEYWORDS = [

    # Cardiac
    "chest pain",
    "chest pressure",
    "pressure in chest",
    "heart attack",
    "cardiac arrest",
    "crushing chest",
    "squeezing chest",
    "arm pain with chest",
    "jaw pain with chest",

    # Respiratory
    "cannot breathe",
    "can't breathe",
    "not breathing",
    "stopped breathing",
    "difficulty breathing",
    "shortness of breath",
    "severe breathlessness",
    "choking",
    "airway blocked",

    # Neurological
    "seizure",
    "convulsion",
    "convulsions",
    "uncontrollable shaking",
    "unconscious",
    "loss of consciousness",
    "passed out",
    "fainted",
    "stroke",
    "facial drooping",
    "sudden weakness",
    "slurred speech",
    "sudden confusion",
    "sudden severe headache",

    # Bleeding
    "severe bleeding",
    "uncontrolled bleeding",
    "blood vomiting",
    "vomiting blood",
    "coughing blood",
    "blood in stools",

    # Other critical
    "paralysis",
    "overdose",
    "poisoning",
    "anaphylaxis",
    "severe allergic reaction",
    "throat swelling",
    "tongue swelling",
    "high fever with stiff neck",
    "bluish lips",
    "bluish skin",
    "not responding",
]

# Combination patterns — two symptoms together = emergency
EMERGENCY_COMBINATIONS = [
    ("fever", "stiff neck"),           # Possible meningitis
    ("chest pain", "sweating"),        # Heart attack
    ("chest pain", "arm pain"),        # Heart attack
    ("chest pain", "jaw pain"),        # Heart attack
    ("sudden headache", "vomiting"),   # Possible brain bleed
    ("seizure", "fever"),              # Febrile seizure / meningitis
    ("difficulty breathing", "rash"),  # Anaphylaxis
    ("high fever", "confusion"),       # Sepsis / meningitis
    ("vomiting blood", "weakness"),    # GI bleed
    ("sudden weakness", "vision"),     # Stroke
    ("chest tightness", "wheezing"),   # Severe asthma
    ("fever", "purple rash"),          # Meningococcal infection
    ("loss of consciousness", "head"), # Head injury
    ("severe abdominal pain", "rigid"),# Peritonitis
]

EMERGENCY_NUMBERS = {
    "India Ambulance": "108",
    "Emergency":       "112",
    "Police":          "100",
    "Fire":            "101",
}


def check_emergency(text):
    """
    Check if text contains emergency symptoms.
    Returns True if emergency detected, False otherwise.

    Checks:
    1. Single keyword matches
    2. Combination pattern matches
    """
    text_lower = text.lower()

    # Single keyword check
    for keyword in EMERGENCY_KEYWORDS:
        if keyword in text_lower:
            return True

    # Combination check
    for combo in EMERGENCY_COMBINATIONS:
        word1, word2 = combo
        if word1 in text_lower and word2 in text_lower:
            return True

    return False


def get_emergency_type(text):
    """
    Identify what type of emergency is detected.
    Returns a string describing the emergency type.
    """
    text_lower = text.lower()

    cardiac_keywords = [
        "chest pain", "heart attack", "cardiac", "chest pressure",
        "arm pain", "jaw pain"
    ]
    respiratory_keywords = [
        "cannot breathe", "can't breathe", "not breathing",
        "choking", "shortness of breath", "difficulty breathing"
    ]
    neurological_keywords = [
        "seizure", "convulsion", "unconscious", "stroke",
        "facial drooping", "slurred speech", "paralysis"
    ]
    bleeding_keywords = [
        "severe bleeding", "vomiting blood", "coughing blood",
        "uncontrolled bleeding"
    ]

    if any(k in text_lower for k in cardiac_keywords):
        return "Possible Cardiac Emergency"
    if any(k in text_lower for k in respiratory_keywords):
        return "Respiratory Emergency"
    if any(k in text_lower for k in neurological_keywords):
        return "Neurological Emergency"
    if any(k in text_lower for k in bleeding_keywords):
        return "Bleeding Emergency"

    return "Medical Emergency"
