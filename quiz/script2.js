// DOM Elements
const welcomeScreen = document.getElementById("welcome-screen")
const quizScreen = document.getElementById("quiz-screen")
const resultsScreen = document.getElementById("results-screen")
const startQuizBtn = document.getElementById("start-quiz-btn")
const submitAnswerBtn = document.getElementById("submit-answer-btn")
const submitExamBtn = document.getElementById("submit-exam-btn")
const submitExamContainer = document.getElementById("submit-exam-container")
const restartQuizBtn = document.getElementById("restart-quiz-btn")
const questionNumber = document.getElementById("question-number")
const difficultyLevel = document.getElementById("difficulty-level")
const questionText = document.getElementById("question-text")
const optionsContainer = document.getElementById("options-container")
const finalScore = document.getElementById("final-score")
const resultsDetails = document.getElementById("results-details")
const webcamContainer = document.getElementById("webcam-container")
const webcamElement = document.getElementById("webcam")
const canvasElement = document.getElementById("canvas")
const captureStatus = document.getElementById("capture-status")
const themeToggleCheckbox = document.getElementById("theme-toggle-checkbox")

const defaultQuestion = {
  question_id: 1,
  question: "Who developed Python Programming Language?",
  difficulty: "easy",
  options: [
    "Wick van Rossum",
    "Rasmus Lerdorf",
    "Guido van Rossum",
    "Niene Stom"
  ],
  correct_answer: "Guido van Rossum"
}

let currentQuestion = defaultQuestion
let selectedOptionIndex = null
let score = 0
let userAnswers = []
let webcamStream = null
let captureInterval = null
let capturedImages = []

const API_ENDPOINTS = {
  SUBMIT_IMAGES: "http://127.0.0.1:8000/api/quiz/submit-eye-data",
}

function initQuiz() {
  startQuizBtn.addEventListener("click", startQuiz)
  submitAnswerBtn.addEventListener("click", submitAnswer)
  submitExamBtn.addEventListener("click", finishQuiz)
  restartQuizBtn.addEventListener("click", restartQuiz)
  themeToggleCheckbox.addEventListener("change", toggleTheme)
  submitAnswerBtn.disabled = true
  loadThemePreference()
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-mode")
    themeToggleCheckbox.checked = true
  } else {
    document.documentElement.classList.remove("dark-mode")
    themeToggleCheckbox.checked = false
  }
}

function toggleTheme() {
  if (themeToggleCheckbox.checked) {
    document.documentElement.classList.add("dark-mode")
    localStorage.setItem("theme", "dark")
  } else {
    document.documentElement.classList.remove("dark-mode")
    localStorage.setItem("theme", "light")
  }
}

async function startQuiz() {
  try {
    startQuizBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...'
    startQuizBtn.disabled = true
    await setupWebcam()
    webcamContainer.classList.remove("hidden")
    submitExamContainer.classList.remove("hidden")
    welcomeScreen.classList.add("hidden")
    quizScreen.classList.remove("hidden")
    displayQuestion(currentQuestion)
    startCapturingImages()
  } catch (error) {
    console.error("Error starting quiz:", error)
    alert("Failed to start quiz. Please ensure you have granted webcam permissions.")
  } finally {
    startQuizBtn.innerHTML = '<i class="fas fa-play"></i> Start Quiz'
    startQuizBtn.disabled = false
  }
}

async function setupWebcam() {
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
    })
    webcamElement.srcObject = webcamStream
    return new Promise(resolve => webcamElement.onloadedmetadata = resolve)
  } catch (error) {
    console.error("Webcam error:", error)
    throw new Error("Webcam access denied")
  }
}

function startCapturingImages() {
  capturedImages = []
  const ctx = canvasElement.getContext("2d")
  canvasElement.width = webcamElement.videoWidth
  canvasElement.height = webcamElement.videoHeight
  captureInterval = setInterval(() => {
    ctx.drawImage(webcamElement, 0, 0)
    capturedImages.push(canvasElement.toDataURL("image/jpeg", 0.7))
    captureStatus.textContent = `Monitoring... (${capturedImages.length} captures)`
  }, 1000)
}

function stopCapturingImages() {
  if (captureInterval) {
    clearInterval(captureInterval)
    captureInterval = null
    captureStatus.textContent = "Paused"
  }
}

function displayQuestion(question) {
  questionNumber.textContent = `Question`
  difficultyLevel.textContent = question.difficulty
  questionText.textContent = question.question
  optionsContainer.innerHTML = ""
  const optionLetters = ["A", "B", "C", "D"]
  question.options.forEach((option, i) => {
    const optionEl = document.createElement("div")
    optionEl.className = "option"
    optionEl.style.animation = `fadeIn 0.3s ease-out ${i * 0.1}s both`
    optionEl.innerHTML = `<span class='option-letter'>${optionLetters[i]}</span><span>${option}</span>`
    optionEl.dataset.index = i
    optionEl.addEventListener("click", () => selectOption(i, optionEl))
    optionsContainer.appendChild(optionEl)
  })
  selectedOptionIndex = null
  submitAnswerBtn.disabled = true
  submitAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Submit Answer'
}

function selectOption(index, el) {
  Array.from(optionsContainer.children).forEach(opt => opt.classList.remove("selected"))
  el.classList.add("selected")
  selectedOptionIndex = index
  submitAnswerBtn.disabled = false
}

async function submitAnswer() {
  if (selectedOptionIndex === null) return;
  stopCapturingImages();
  submitAnswerBtn.disabled = true;
  submitAnswerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  const selectedOption = currentQuestion.options[selectedOptionIndex];

  try {
    const payload = {
      question_id: currentQuestion.question_id,
      selected_option: selectedOption,
      images: capturedImages,
    };

    const res = await fetch(API_ENDPOINTS.SUBMIT_IMAGES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Response from server:", data);
    userAnswers.push({
      question_id: currentQuestion.question_id,
      selected_option: selectedOption,
      isCorrect: data.isCorrect,
    });

    currentQuestion = data.next_question;
    displayQuestion(currentQuestion);
    startCapturingImages();
  } catch (err) {
    console.error("Error submitting answer:", err);
    alert("There was a problem submitting your answer. Please try again.");
  } finally {
    submitAnswerBtn.disabled = false;
    submitAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Submit Answer';
    capturedImages = [];
  }
}


async function finishQuiz() {
  if (userAnswers.length === 0) return alert("Please answer at least one question before submitting.")
  submitExamBtn.disabled = true
  submitExamBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...'
  if (webcamStream) webcamStream.getTracks().forEach(track => track.stop())
  webcamContainer.classList.add("hidden")
  submitExamContainer.classList.add("hidden")
  quizScreen.classList.add("hidden")
  resultsScreen.classList.remove("hidden")
  const correctAnswers = userAnswers.filter(ans => ans.isCorrect).length;
  finalScore.textContent = `You scored ${correctAnswers} out of ${userAnswers.length}`;
  resultsDetails.innerHTML = ""
  userAnswers.forEach((ans, i) => {
    const resultItem = document.createElement("div")
    resultItem.className = "result-item"
    resultItem.style.animation = `fadeIn 0.3s ease-out ${i * 0.1}s both`
    resultItem.innerHTML = `
      <div class="result-question">Q${i + 1}: ${ans.selected_option}</div>
      <div class="result-answer ${ans.isCorrect ? "correct" : "incorrect"}">
        <span class="result-icon ${ans.isCorrect ? "correct" : "incorrect"}"><i class="fas ${ans.isCorrect ? "fa-check" : "fa-times"}"></i></span>
        <span>${ans.isCorrect ? "Correct" : "Incorrect"}</span>
      </div>`
    resultsDetails.appendChild(resultItem)
  })

  
}

function restartQuiz() {
  currentQuestion = defaultQuestion
  selectedOptionIndex = null
  score = 0
  userAnswers = []
  welcomeScreen.classList.remove("hidden")
  resultsScreen.classList.add("hidden")
  submitExamBtn.disabled = false
  submitExamBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Exam'
}

document.addEventListener("DOMContentLoaded", initQuiz)
