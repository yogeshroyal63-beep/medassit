# -----------------------------------------------
# Severity Rules — All 60 Conditions
# With age-based and duration-based boosting
# -----------------------------------------------

SEVERITY_MAP = {

    # --- Low severity ---
    "CommonCold":        "low",
    "Allergy":           "low",
    "MuscleStrain":      "low",
    "TensionHeadache":   "low",
    "Eczema":            "low",
    "Conjunctivitis":    "low",
    "Gout":              "low",
    "SkinInfection":     "low",
    "Hemorrhoids":       "low",
    "MouthUlcer":        "low",
    "PinkEye":           "low",
    "Ringworm":          "low",

    # --- Moderate severity ---
    "Flu":               "moderate",
    "ViralFever":        "moderate",
    "Migraine":          "moderate",
    "FoodPoisoning":     "moderate",
    "UrinaryInfection":  "moderate",
    "Vertigo":           "moderate",
    "Dehydration":       "moderate",
    "AnxietyAttack":     "moderate",
    "PanicAttack":       "moderate",
    "Sinusitis":         "moderate",
    "Bronchitis":        "moderate",
    "Gastritis":         "moderate",
    "PepticUlcer":       "moderate",
    "Depression":        "moderate",
    "ThyroidDisorder":   "moderate",
    "DiabetesSymptoms":  "moderate",
    "Chickenpox":        "moderate",
    "Dengue":            "moderate",
    "Typhoid":           "moderate",
    "Malaria":           "moderate",
    "GERD":              "moderate",
    "IrritableBowel":    "moderate",
    "Psoriasis":         "moderate",
    "SleepDisorder":     "moderate",
    "CervicalSpondylosis": "moderate",
    "Sciatica":          "moderate",
    "Tonsillitis":       "moderate",
    "OtitisMedia":       "moderate",

    # --- High severity ---
    "Asthma":            "high",
    "Pneumonia":         "high",
    "Hypertension":      "high",
    "Anemia":            "high",
    "FractureRisk":      "high",
    "KidneyStone":       "high",
    "Appendicitis":      "high",
    "GallstoneAttack":   "high",
    "Jaundice":          "high",
    "LiverDisease":      "high",
    "Tuberculosis":      "high",
    "COVID19":           "high",
    "DeepVeinThrombosis": "high",
    "Pancreatitis":      "high",
    "CeliacDisease":     "high",

    # --- Critical severity ---
    "HeartAttackRisk":   "critical",
    "SeizureRisk":       "critical",
    "StrokeRisk":        "critical",
    "Meningitis":        "critical",
    "PneumothoraxRisk":  "critical",
    "SepsisSigns":       "critical",
    "AnaphalaxisRisk":   "critical",
    "DiabeticKetoacidosis": "critical",
    "PulmonaryEmbolism": "critical",
    "AcuteRenalFailure": "critical",
}

# Severity ordering for comparison
SEVERITY_ORDER = {
    "low":      1,
    "moderate": 2,
    "high":     3,
    "critical": 4,
    "unknown":  0
}

# Conditions that get upgraded in elderly patients (65+)
ELDERLY_UPGRADE = {
    "Flu":               "high",
    "Pneumonia":         "critical",
    "Dehydration":       "high",
    "FoodPoisoning":     "high",
    "Dengue":            "high",
    "Hypertension":      "critical",
    "DiabetesSymptoms":  "high",
    "AnxietyAttack":     "high",
    "Anemia":            "critical",
    "COVID19":           "critical",
    "Bronchitis":        "high",
    "GERD":              "high",
    "CervicalSpondylosis": "high",
    "DeepVeinThrombosis": "critical",
    "Pancreatitis":      "critical",
}

# Conditions that get upgraded in children (under 5)
CHILD_UPGRADE = {
    "Flu":               "high",
    "Dehydration":       "critical",
    "FoodPoisoning":     "high",
    "ViralFever":        "high",
    "Chickenpox":        "high",
    "Dengue":            "high",
    "Meningitis":        "critical",
    "Pneumonia":         "critical",
    "OtitisMedia":       "high",
    "Tonsillitis":       "high",
    "AnaphalaxisRisk":   "critical",
}


def get_severity(condition, age=None):
    base_severity = SEVERITY_MAP.get(condition, "unknown")
    if age is None:
        return base_severity
    try:
        age = int(age)
    except (ValueError, TypeError):
        return base_severity
    if age >= 65:
        upgraded = ELDERLY_UPGRADE.get(condition)
        if upgraded and SEVERITY_ORDER.get(upgraded, 0) > SEVERITY_ORDER.get(base_severity, 0):
            return upgraded
    if age < 5:
        upgraded = CHILD_UPGRADE.get(condition)
        if upgraded and SEVERITY_ORDER.get(upgraded, 0) > SEVERITY_ORDER.get(base_severity, 0):
            return upgraded
    return base_severity


def get_care_advice(severity, condition):
    advice = {
        "low": {
            "action":    "Self-care at home is appropriate",
            "urgency":   "See a doctor if symptoms persist beyond 3-5 days",
            "home_care": "Rest, stay hydrated, and monitor symptoms",
        },
        "moderate": {
            "action":    "Schedule a doctor appointment soon",
            "urgency":   "See a doctor within 24-48 hours",
            "home_care": "Rest, avoid strenuous activity, monitor for worsening",
        },
        "high": {
            "action":    "See a doctor today",
            "urgency":   "Do not delay — visit a clinic or hospital today",
            "home_care": "Do not self-medicate. Medical evaluation required.",
        },
        "critical": {
            "action":    "Seek emergency care immediately",
            "urgency":   "Go to the nearest emergency room NOW",
            "home_care": "Do not wait. Call emergency services if needed.",
        },
        "unknown": {
            "action":    "Consult a healthcare professional",
            "urgency":   "See a doctor for proper evaluation",
            "home_care": "Monitor symptoms and rest",
        }
    }
    return advice.get(severity, advice["unknown"])
