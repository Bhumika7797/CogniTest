from typing import List
from pydantic import BaseModel

class EyeDataRequest(BaseModel):
    question_id: int                # ✅ Replaces questionIndex
    selected_option: str           # ✅ Replaces isCorrect
    images: List[str]              # ✅ Base64-encoded image frames

class CognitivePredictionResponse(BaseModel):
    predicted_state: str
    next_question: dict
    isCorrect: bool