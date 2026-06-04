import re

# -----------------------------------------------
# Intent Detection
# -----------------------------------------------

# Use word boundary patterns to avoid false matches
MEDICINE_KEYWORDS = [
    r"\bmedicine\b",
    r"\btablet\b",
    r"\btablets\b",
    r"\bcapsule\b",
    r"\bcapsules\b",
    r"\bdose\b",
    r"\bdosage\b",
    r"\bprescription\b",
    r"\bparacetamol\b",
    r"\bcrocin\b",
    r"\bibuprofen\b",
    r"\bamoxicillin\b",
    r"\bazithromycin\b",
    r"\bmetformin\b",
    r"\bomeprazole\b",
    r"\bcetirizine\b",
    r"\baspirin\b",
    r"\bwhat is\b.*\b(mg|ml|tablet|capsule)\b",
    r"\bside effects\b",
    r"\bhow to take\b",
    r"\bcan i take\b",
    r"\bshould i take\b",
]

MENTAL_HEALTH_KEYWORDS = [
    "kill myself",
    "suicide",
    "suicidal",
    "harm myself",
    "want to die",
    "end my life",
    "no reason to live",
    "better off dead",
    "hurt myself",
    "self harm",
    "self-harm",
]

DURATION_KEYWORDS = [
    r"\bfor \d+ days\b",
    r"\bfor \d+ weeks\b",
    r"\bfor \d+ months\b",
    r"\bsince \d+ days\b",
    r"\bsince yesterday\b",
    r"\bsince last week\b",
    r"\bchronic\b",
    r"\bpersistent\b",
    r"\blong time\b",
    r"\bmonths\b",
]

FOLLOWUP_KEYWORDS = [
    "still have",
    "still feeling",
    "not getting better",
    "getting worse",
    "worsening",
    "no improvement",
    "same symptoms",
    "coming back",
    "recurring",
]

GREETING_KEYWORDS = [
    "hello", "hi", "hey", "good morning",
    "good evening", "good afternoon", "namaste",
]


def detect_intent(text):
    """
    Detect the intent of the user input.

    Returns one of:
    - mental_health_crisis
    - medicine_query
    - followup_query
    - symptom_query_chronic (with duration)
    - greeting
    - symptom_query (default)
    """
    text_lower = text.lower().strip()

    # 1. Mental health crisis — highest priority
    for phrase in MENTAL_HEALTH_KEYWORDS:
        if phrase in text_lower:
            return "mental_health_crisis"

    # 2. Greeting — before anything else
    for word in GREETING_KEYWORDS:
        if text_lower.startswith(word):
            return "greeting"

    # 3. Medicine query — use regex with word boundaries
    for pattern in MEDICINE_KEYWORDS:
        if re.search(pattern, text_lower):
            return "medicine_query"

    # 4. Follow-up query
    for phrase in FOLLOWUP_KEYWORDS:
        if phrase in text_lower:
            return "followup_query"

    # 5. Chronic/duration symptoms
    for pattern in DURATION_KEYWORDS:
        if re.search(pattern, text_lower):
            return "symptom_query_chronic"

    # 6. Default — symptom query
    return "symptom_query"
