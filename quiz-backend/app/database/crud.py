from sqlalchemy.orm import Session
from app.database import models

# def get_question_by_difficulty(db: Session, difficulty: str):
#     return db.query(models.Question).filter(models.Question.difficulty == difficulty).first()


from sqlalchemy import text

def get_question_by_difficulty(db: Session, difficulty: str, current_qn_id: int):
    query = text("""
    SELECT * FROM python 
    WHERE difficulty = :difficulty AND id != :current_id 
    ORDER BY RANDOM()
    LIMIT 1
""")

    result = db.execute(query, {"difficulty": difficulty, "current_id": current_qn_id}).fetchone()
    return result
