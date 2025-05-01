from sqlalchemy import Column, Integer, String
from app.database.config import Base

class Question(Base):
    __tablename__ = "python"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    option1 = Column(String)
    option2 = Column(String)
    option3 = Column(String)
    option4 = Column(String)
    correct_answer = Column(String)
    difficulty = Column(String)
