from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from sqlalchemy.orm import Session
import numpy as np
from app.schemas.request_response import EyeDataRequest, CognitivePredictionResponse
from app.utils.image_decoder import decode_base64_image
from app.utils.feature_extractor import extract_features_from_images
from app.models.predictor import predict_cognitive_state
from app.database import crud, models, config
import traceback
import os


router = APIRouter()
EXPECTED_FEATURE_LENGTH = 11


def get_db():
    db = config.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/submit-eye-data", response_model=CognitivePredictionResponse)
def submit_eye_data(data: EyeDataRequest, db: Session = Depends(get_db)):
    try:
        print("Received EyeDataRequest:", data)
        print(f"Received {len(data.images)} images for analysis.")
        decoded_images = []

        for base64_image in data.images:
            img = decode_base64_image(base64_image)
            if img is None:
                print("Warning: Skipping image - decode_base64_image returned None.")
                continue
            decoded_images.append(img)

        if not decoded_images:
            raise HTTPException(status_code=400, detail="No valid images to process.")

        # Extract features
        features = extract_features_from_images(decoded_images)
        features = np.array(features)

        if features.ndim == 2:
            if features.shape[1] != EXPECTED_FEATURE_LENGTH:
                raise HTTPException(status_code=400, detail=f"Expected {EXPECTED_FEATURE_LENGTH} features, got {features.shape[1]}.")
            features = np.mean(features, axis=0).reshape(1, -1)
        elif features.ndim == 1:
            if len(features) != EXPECTED_FEATURE_LENGTH:
                raise HTTPException(status_code=400, detail=f"Expected {EXPECTED_FEATURE_LENGTH} features, got {len(features)}.")
            features = features.reshape(1, -1)
        else:
            raise HTTPException(status_code=400, detail="Invalid feature format.")

        feature_names = [
            "FixationDuration",
            "SaccadeSpeed",
            "BlinkRate",
            "Number of Fixations",
            "Fixation Duration",
            "Average Fixation Duration",
            "Number of Saccades",
            "Saccade Amplitude",
            "Average Saccade Amplitude",
            "Average Pupil Size (Left, mm)",
            "Average Pupil Size (Right, mm)"
        ]

        features_df = pd.DataFrame(features, columns=feature_names)
        print("Features DataFrame:", features_df)

        # Optional: save for debugging
        file_path = "features_log.csv"
        write_header = not os.path.exists(file_path)
        features_df.to_csv(file_path, mode='a', header=write_header, index=False)

        # Cognitive prediction
        predicted_state = predict_cognitive_state(features_df)
        print(f"Predicted cognitive state: {predicted_state}")

        # ✔️ Get selected option and correct answer
        selected_option = data.selected_option
        question = db.query(models.Question).filter(models.Question.id == data.question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found.")

        is_correct = selected_option == question.correct_answer
        print(f"Selected: {selected_option}, Correct: {question.correct_answer}, Is Correct: {is_correct}")

        # Fetch next question
        next_question = fetch_next_question(predicted_state, db, data.question_id)
        print(f"Next question fetched: {next_question}")

        return CognitivePredictionResponse(
            predicted_state=predicted_state,
            next_question=next_question,
            isCorrect=is_correct
        )

    except Exception as e:
        print("❌ Exception occurred in submit_eye_data:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error while processing eye data")


def fetch_next_question(state: str, db: Session, current_qn_id: int):
    difficulty_map = {
        "Confident": "hard",
        "Confused": "medium",
        "Guessing": "easy"
    }
    difficulty = difficulty_map.get(state, "medium")
    print(f"Fetching next question with difficulty: {difficulty}")

    next_question = crud.get_question_by_difficulty(db, difficulty, current_qn_id)
    
    if not next_question:
        raise HTTPException(status_code=404, detail="No question found for this difficulty.")
    
    return {
        "question_id": next_question.id,
        "difficulty": next_question.difficulty,
        "question": next_question.question,
        "options": [next_question.option1, next_question.option2, next_question.option3, next_question.option4]
    }
