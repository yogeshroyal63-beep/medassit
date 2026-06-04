# -----------------------------------------------
# Specialty Mapper — All 60 Conditions
# Primary + Secondary specialty recommendations
# -----------------------------------------------

SPECIALTY_MAP = {

    # --- General / Internal Medicine ---
    "Flu":                   ("General Physician", "Infectious Disease"),
    "CommonCold":            ("General Physician", None),
    "ViralFever":            ("General Physician", "Infectious Disease"),
    "Dehydration":           ("General Physician", None),
    "Typhoid":               ("General Physician", "Infectious Disease"),
    "Dengue":                ("General Physician", "Infectious Disease"),
    "Malaria":               ("General Physician", "Infectious Disease"),
    "Chickenpox":            ("General Physician", "Dermatologist"),
    "COVID19":               ("General Physician", "Pulmonologist"),
    "Tuberculosis":          ("Pulmonologist", "Infectious Disease"),
    "SepsisSigns":           ("Emergency Medicine", "Infectious Disease"),

    # --- Pulmonology ---
    "Asthma":                ("Pulmonologist", "Allergist"),
    "Pneumonia":             ("Pulmonologist", "General Physician"),
    "Bronchitis":            ("Pulmonologist", "General Physician"),
    "PneumothoraxRisk":      ("Pulmonologist", "Emergency Medicine"),
    "PulmonaryEmbolism":     ("Pulmonologist", "Emergency Medicine"),

    # --- Cardiology ---
    "HeartAttackRisk":       ("Cardiologist", "Emergency Medicine"),
    "Hypertension":          ("Cardiologist", "General Physician"),
    "DeepVeinThrombosis":    ("Cardiologist", "Vascular Surgeon"),

    # --- Neurology ---
    "Migraine":              ("Neurologist", "General Physician"),
    "TensionHeadache":       ("Neurologist", "General Physician"),
    "SeizureRisk":           ("Neurologist", "Emergency Medicine"),
    "StrokeRisk":            ("Neurologist", "Emergency Medicine"),
    "Vertigo":               ("Neurologist", "ENT Specialist"),
    "Meningitis":            ("Neurologist", "Emergency Medicine"),
    "CervicalSpondylosis":   ("Neurologist", "Orthopedic Specialist"),
    "Sciatica":              ("Neurologist", "Orthopedic Specialist"),

    # --- Gastroenterology ---
    "FoodPoisoning":         ("Gastroenterologist", "General Physician"),
    "Gastritis":             ("Gastroenterologist", "General Physician"),
    "Appendicitis":          ("Gastroenterologist", "General Surgeon"),
    "PepticUlcer":           ("Gastroenterologist", "General Physician"),
    "GallstoneAttack":       ("Gastroenterologist", "General Surgeon"),
    "LiverDisease":          ("Gastroenterologist", "Hepatologist"),
    "Jaundice":              ("Gastroenterologist", "Hepatologist"),
    "GERD":                  ("Gastroenterologist", "General Physician"),
    "IrritableBowel":        ("Gastroenterologist", "General Physician"),
    "Pancreatitis":          ("Gastroenterologist", "General Surgeon"),
    "CeliacDisease":         ("Gastroenterologist", "Dietitian"),
    "Hemorrhoids":           ("Gastroenterologist", "General Surgeon"),

    # --- Urology / Nephrology ---
    "UrinaryInfection":      ("Urologist", "General Physician"),
    "KidneyStone":           ("Urologist", "Nephrologist"),
    "AcuteRenalFailure":     ("Nephrologist", "Emergency Medicine"),

    # --- Endocrinology ---
    "DiabetesSymptoms":      ("Endocrinologist", "General Physician"),
    "ThyroidDisorder":       ("Endocrinologist", "General Physician"),
    "DiabeticKetoacidosis":  ("Endocrinologist", "Emergency Medicine"),

    # --- Hematology ---
    "Anemia":                ("Hematologist", "General Physician"),

    # --- Orthopedics ---
    "MuscleStrain":          ("Orthopedic Specialist", "Physiotherapist"),
    "FractureRisk":          ("Orthopedic Specialist", "Emergency Medicine"),
    "Gout":                  ("Rheumatologist", "Orthopedic Specialist"),

    # --- Psychiatry / Psychology ---
    "AnxietyAttack":         ("Psychiatrist", "General Physician"),
    "PanicAttack":           ("Psychiatrist", "General Physician"),
    "Depression":            ("Psychiatrist", "Psychologist"),
    "SleepDisorder":         ("Psychiatrist", "Neurologist"),

    # --- ENT ---
    "Sinusitis":             ("ENT Specialist", "General Physician"),
    "Tonsillitis":           ("ENT Specialist", "General Physician"),
    "OtitisMedia":           ("ENT Specialist", "General Physician"),

    # --- Dermatology ---
    "SkinInfection":         ("Dermatologist", "General Physician"),
    "Allergy":               ("Allergist", "Dermatologist"),
    "Eczema":                ("Dermatologist", "Allergist"),
    "Psoriasis":             ("Dermatologist", None),
    "Ringworm":              ("Dermatologist", "General Physician"),
    "AnaphalaxisRisk":       ("Allergist", "Emergency Medicine"),

    # --- Ophthalmology ---
    "Conjunctivitis":        ("Ophthalmologist", "General Physician"),
    "PinkEye":               ("Ophthalmologist", "General Physician"),

    # --- Oral ---
    "MouthUlcer":            ("General Physician", "Dentist"),
}


def get_specialty(condition):
    result = SPECIALTY_MAP.get(condition)
    if result:
        return result[0]
    return "General Physician"


def get_specialty_full(condition):
    result = SPECIALTY_MAP.get(condition)
    if result:
        return {"primary": result[0], "secondary": result[1]}
    return {"primary": "General Physician", "secondary": None}
