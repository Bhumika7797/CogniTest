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
![image](https://github.com/user-attachments/assets/a909d63d-1401-4f30-838f-273b36c677d4)
![image](https://github.com/user-attachments/assets/e8a2c27a-9b82-43eb-94e9-14cda6331df7)
![image](https://github.com/user-attachments/assets/3553befb-991f-49a7-9454-e23a73648cca)



