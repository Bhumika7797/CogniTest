##  🧠 Cognitest – AI-Powered Exam Intelligence
Cognitest is an intelligent exam monitoring and analysis system that integrates **AI**, **facial recognition**, and **eye movement analysis** to assess a student's confidence and attention during online quizzes. 

This full-stack app includes:
- A **frontend quiz interface** (HTML/CSS/JavaScript)
- A **Python backend** with FastAPI
- Machine learning models for behavior-based evaluation
---
## 🗂️ Project Structure
<details>
  <summary>📁 <strong>Folder Structure (Click to expand)</strong></summary>

ai-exam-app/ ├── quiz/ # Frontend application │ ├── index.html │ ├── script.js │ ├── script2.js │ └── styles.css │ └── quiz-backend/ # Backend API (FastAPI) ├── app/ │ ├── database/ # DB config and models │ ├── ml_models/ # AI/ML models for prediction │ ├── models/ # Pydantic models │ ├── routes/ # API route definitions │ ├── schemas/ # Data validation schemas │ ├── utils/ # Helper functions │ ├── init.py │ └── main.py # FastAPI entry point ├── requirements.txt ├── features_log.csv # Logs of extracted features └── README.md
</details>


---

## 🚀 Getting Started

### ✅ Requirements

Make sure you have:
- Python 3.8+
- Node.js (optional, if expanding frontend)
- pip or conda

### 🔧 Backend Setup

```bash
cd quiz-backend
python -m venv env
source env/bin/activate  # For Windows: env\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🖥️ Frontend Setup
- Open quiz/index.html in your browser or serve it using any static file server.

## 🎯 Features
- 🎥 Real-time eye movement detection

- 🔒 Face recognition for identity verification

- 📊 ML-based confidence detection

- 💾 Stores extracted features (features_log.csv)

-⚡ FastAPI-based backend

## 📦 Dependencies
- FastAPI

- OpenCV

- dlib

- scikit-learn

- TensorFlow/Keras

- Pandas, NumPy
Install using:
```bash
pip install -r requirements.txt
```

## 🛠️ Usage
1. Run backend with:
```bash
uvicorn app.main:app --reload
```
2. Open quiz/index.html in your browser to start the test.

3. Eye movement and facial data are logged and analyzed for confidence prediction.

## 💡 Future Improvements
📈 Add dashboard for detailed student analysis
🧪 Improve accuracy using more training data
🔐 Add authentication for admin/student roles

## 🤝 Contributing
Contributions are welcome! Fork the repo and raise a pull request. For major changes, please open an issue first.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file.

## USER INTERFACE
![image](https://github.com/user-attachments/assets/ad3fe947-e259-4395-ab7f-3db2009bd9b7)
![image](https://github.com/user-attachments/assets/32423de3-2f7b-4aa6-826b-8d7862d13c33)
