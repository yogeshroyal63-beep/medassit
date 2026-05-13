import re

# Minimum real medical/symptom words needed to pass validation
# Fixed: was 2, which incorrectly rejected valid single-word medical terms
# like "dengue", "malaria", "seizure" that should trigger emergency or classifier paths.
MIN_WORDS = 1
MIN_CHARS = 5

# Common valid symptom words — input must contain at least one
VALID_SYMPTOM_WORDS = {
    "pain", "fever", "cough", "headache", "nausea", "vomiting", "diarrhea",
    "fatigue", "weakness", "dizziness", "swelling", "rash", "itching",
    "breathing", "breath", "chest", "stomach", "back", "throat", "nose",
    "eye", "ear", "skin", "joint", "muscle", "bone", "heart", "blood",
    "urine", "stool", "weight", "appetite", "sleep", "tired", "hurt",
    "ache", "sore", "burning", "discharge", "bleeding", "numb", "tingling",
    "shaking", "trembling", "confusion", "unconscious", "seizure", "faint",
    "sneeze", "sneezing", "congestion", "phlegm", "mucus", "wheezing",
    "thirst", "hunger", "cold", "chills", "sweating", "yellow", "pale",
    "feel", "feeling", "having", "experiencing", "suffering", "since",
    "days", "weeks", "morning", "night", "sudden", "severe", "mild",
    "dengue", "malaria", "typhoid", "asthma", "diabetes", "pressure",
    "infection", "allergy", "migraine", "vertigo", "anxiety", "depression",
}

# Patterns that indicate injection / XSS attempts
_HTML_TAG_RE     = re.compile(r"<[^>]+>", re.IGNORECASE)
_SCRIPT_RE       = re.compile(r"<\s*script[\s\S]*?>[\s\S]*?<\s*/\s*script\s*>", re.IGNORECASE)
_EVENT_HANDLER_RE = re.compile(r"\bon\w+\s*=", re.IGNORECASE)          # onclick=, onerror=, …
_JS_PROTO_RE     = re.compile(r"javascript\s*:", re.IGNORECASE)
_SQL_RE          = re.compile(
    r"\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR\s+1=1|--)\b", re.IGNORECASE
)


def sanitize_input(text: str) -> str:
    """
    Strip HTML tags, script blocks, event handlers, javascript: URIs, and
    obvious SQL injection patterns from user input.
    Returns the cleaned plain-text string.
    """
    if not text:
        return text
    # Remove <script>…</script> blocks first (before generic tag strip)
    text = _SCRIPT_RE.sub(" ", text)
    # Strip all remaining HTML/XML tags
    text = _HTML_TAG_RE.sub(" ", text)
    # Remove event handler attributes (onclick=…)
    text = _EVENT_HANDLER_RE.sub(" ", text)
    # Remove javascript: protocol references
    text = _JS_PROTO_RE.sub(" ", text)
    # Remove SQL injection keywords
    text = _SQL_RE.sub(" ", text)
    # Collapse multiple whitespace characters into one
    text = re.sub(r"\s+", " ", text).strip()
    return text


def validate_input(text):
    """
    Sanitize and validate user input before processing.

    Strips HTML/script/SQL injection content first, then checks for
    sufficient medical symptom content.

    Returns:
        (bool, str) — (is_valid, reason_if_invalid)
        The first element of the returned tuple is the *sanitized* text
        when valid, so callers should unpack both values:
            ok, cleaned = validate_input(raw)
    """
    if not text:
        return False, "Input is empty. Please describe your symptoms."

    # Sanitize before any length/content checks
    text = sanitize_input(text)

    # Too short
    if len(text) < MIN_CHARS:
        return False, "Input too short. Please describe your symptoms in more detail."

    # Too long (likely spam)
    if len(text) > 1000:
        return False, "Input too long. Please describe your main symptoms briefly."

    # Only numbers or special characters
    if re.match(r'^[\d\s\W]+$', text):
        return False, "Please describe your symptoms in words."

    words = text.lower().split()

    # Too few words
    if len(words) < MIN_WORDS:
        return False, "Please describe at least two symptoms for better analysis."

    # Gibberish detection — check if any valid symptom word exists
    has_valid_word = any(word in VALID_SYMPTOM_WORDS for word in words)

    # Also accept if any word is longer than 4 chars (likely a real word)
    has_real_word = any(len(word) > 4 and word.isalpha() for word in words)

    if not has_valid_word and not has_real_word:
        return False, "Could not understand the input. Please describe your symptoms clearly."

    # Return the sanitized text so callers use the cleaned version
    return True, text
