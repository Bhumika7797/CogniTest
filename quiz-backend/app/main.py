from fastapi import FastAPI
from app.routes.quiz import router as quiz_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Add CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can set this to your frontend URL like ["http://127.0.0.1:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(quiz_router, prefix="/api/quiz")
