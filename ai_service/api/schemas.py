from pydantic import BaseModel, Field
from typing import List, Optional


class SymptomRequest(BaseModel):
    symptoms: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Patient symptom description in plain text"
    )
    age: Optional[int] = Field(
        default=None,
        ge=0,
        le=120,
        description="Patient age in years (optional but improves accuracy)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "symptoms": "I have fever and severe headache since 2 days",
                "age": 35
            }
        }


class Prediction(BaseModel):
    condition:  str
    confidence: float


class SpecialtyInfo(BaseModel):
    primary:   str
    secondary: Optional[str]


class CareAdvice(BaseModel):
    action:    str
    urgency:   str
    home_care: str


class TriageResponse(BaseModel):
    status:          str
    predictions:     Optional[List[Prediction]]
    top_condition:   Optional[str]
    severity:        Optional[str]
    specialty:       Optional[SpecialtyInfo]
    advice:          Optional[CareAdvice]
    age_considered:  Optional[bool]
    intent_note:     Optional[str]
    disclaimer:      str
