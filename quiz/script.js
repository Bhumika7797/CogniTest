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
const questionText = document.getElementById("question-text")                 // Question text
const optionsContainer = document.getElementById("options-container")         // Options
const finalScore = document.getElementById("final-score")
const resultsDetails = document.getElementById("results-details")
const webcamContainer = document.getElementById("webcam-container")
const webcamElement = document.getElementById("webcam")
const canvasElement = document.getElementById("canvas")
const captureStatus = document.getElementById("capture-status")
const themeToggleCheckbox = document.getElementById("theme-toggle-checkbox")




const defaultQuestion = {
  
  question: "Who developed Python Programming Language?",
    difficulty: "easy",
    options: [
      "Wick van Rossum",
      "Rasmus Lerdorf",
      "Guido van Rossum",
      "Niene Stom"
    ],
    correct_answer:"Guido van Rossum"
};




// Quiz state
let currentQuestionIndex = 0
let selectedOptionIndex = null
let score = 0
let quizQuestions = []
let userAnswers = []
let webcamStream = null
let captureInterval = null
let capturedImages = []
let answeredQuestions = new Set()

// API endpoints
const API_ENDPOINTS = {
  FETCH_QUESTIONS: "https://api.example.com/questions",
  SUBMIT_IMAGES: "http://127.0.0.1:8000/api/quiz/submit-eye-data",
  GET_SCORE: "https://api.example.com/score",
}

// Initialize the quiz
function initQuiz() {
  startQuizBtn.addEventListener("click", startQuiz)
  submitAnswerBtn.addEventListener("click", submitAnswer)
  submitExamBtn.addEventListener("click", finishQuiz)
  restartQuizBtn.addEventListener("click", restartQuiz)
  themeToggleCheckbox.addEventListener("change", toggleTheme)
  submitAnswerBtn.disabled = true

  // Load saved theme preference
  loadThemePreference()
}

// Load theme preference from localStorage
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

// Toggle between light and dark theme
function toggleTheme() {
  if (themeToggleCheckbox.checked) {
    document.documentElement.classList.add("dark-mode")
    localStorage.setItem("theme", "dark")
  } else {
    document.documentElement.classList.remove("dark-mode")
    localStorage.setItem("theme", "light")
  }
}

// Start the quiz
async function startQuiz() {
  try {
    // Add loading animation to button
    startQuizBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...'
    startQuizBtn.disabled = true // Disable button while loading

    // Request webcam access
    await setupWebcam()

    // Show webcam container
    webcamContainer.classList.remove("hidden")

    // Show submit exam button container
    submitExamContainer.classList.remove("hidden")

    // Fetch initial questions
    //await fetchQuestions()

    // difficultyLevel.textContent = defaultQuestion.difficulty
    // questionText.textContent = defaultQuestion.question


    // Show quiz screen
    welcomeScreen.classList.add("hidden")
    quizScreen.classList.remove("hidden")

    // Display first question
    // displayQuestion(currentQuestionIndex)

    displayDefaultQuestion();

    // Start capturing images
    startCapturingImages()
  } catch (error) {
    console.error("Error starting quiz:", error)
    alert("Failed to start quiz. Please ensure you have granted webcam permissions and try again.")

    // Remove any loading overlays that might be stuck
    const loadingEl = document.querySelector(".loading-overlay")
    if (loadingEl && document.body.contains(loadingEl)) {
      document.body.removeChild(loadingEl)
    }
  } finally {
    // Reset button text
    startQuizBtn.innerHTML = '<i class="fas fa-play"></i> Start Quiz'
    startQuizBtn.disabled = false // Re-enable button
  }
}

// Setup webcam
async function setupWebcam() {
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
    })
    webcamElement.srcObject = webcamStream
    return new Promise((resolve) => {
      webcamElement.onloadedmetadata = () => {
        resolve()
      }
    })
  } catch (error) {
    console.error("Error accessing webcam:", error)
    throw new Error("Webcam access denied")
  }
}

// Start capturing images
function startCapturingImages() {
  capturedImages = []
  const context = canvasElement.getContext("2d")
  canvasElement.width = webcamElement.videoWidth
  canvasElement.height = webcamElement.videoHeight

  captureInterval = setInterval(() => {
    context.drawImage(webcamElement, 0, 0, canvasElement.width, canvasElement.height)
    const imageData = canvasElement.toDataURL("image/jpeg", 0.7)
    capturedImages.push(imageData)

    // Update capture status with count
    captureStatus.textContent = `Monitoring... (${capturedImages.length} captures)`
  }, 1000)
}

// Stop capturing images
function stopCapturingImages() {
  if (captureInterval) {
    clearInterval(captureInterval)
    captureInterval = null
    captureStatus.textContent = "Paused"
  }
}

// Fetch questions from API
async function fetchQuestions(difficulty = "medium") {
  let loadingEl = null
  try {
    // Show loading animation
    loadingEl = document.createElement("div")
    loadingEl.className = "loading-overlay"
    loadingEl.innerHTML = '<div class="loading-spinner"></div><p>Loading questions...</p>'
    document.body.appendChild(loadingEl)

    const response = await fetch(`${API_ENDPOINTS.FETCH_QUESTIONS}?difficulty=${difficulty}`)
    if (!response.ok) {
      throw new Error("Failed to fetch questions")
    }

    // For demo purposes, we'll use mock data
    // In a real application, you would parse the response: const data = await response.json();
    quizQuestions = getMockQuestions()

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return quizQuestions
  } catch (error) {
    console.error("Error fetching questions:", error)
    // Fallback to mock questions if API fails
    quizQuestions = getMockQuestions()
    return quizQuestions
  } finally {
    // Always remove loading animation in finally block
    if (loadingEl && document.body.contains(loadingEl)) {
      document.body.removeChild(loadingEl)
    }
  }
}



function displayDefaultQuestion() {
  const question = defaultQuestion;
  questionNumber.textContent = `Question`
  difficultyLevel.textContent = question.difficulty;
  questionText.textContent = question.question;

  // Set difficulty color
  switch (question.difficulty.toLowerCase()) {
    case "easy":
      difficultyLevel.style.color = "#2ecc71";
      break;
    case "medium":
      difficultyLevel.style.color = "#e67e22";
      break;
    case "hard":
      difficultyLevel.style.color = "#e74c3c";
      break;
  }

  // Clear options container
  optionsContainer.innerHTML = "";

  // Add options with animation delay
  const optionLetters = ["A", "B", "C", "D"];
  question.options.forEach((option, i) => {
    const optionElement = document.createElement("div");
    optionElement.className = "option";
    optionElement.style.animation = `fadeIn 0.3s ease-out ${i * 0.1}s both`;

    const letterSpan = document.createElement("span");
    letterSpan.className = "option-letter";
    letterSpan.textContent = optionLetters[i];

    const optionText = document.createElement("span");
    optionText.textContent = option;

    optionElement.appendChild(letterSpan);
    optionElement.appendChild(optionText);
    optionElement.dataset.index = i;

    // Enable option selection
    optionElement.addEventListener("click", () => selectOption(i, optionElement));

    optionsContainer.appendChild(optionElement);
  });

  // Reset selection state
  selectedOptionIndex = null;
  submitAnswerBtn.disabled = true;

  // Always show "Submit Answer" text
  submitAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Submit Answer';

  // Start capturing images for default question
  startCapturingImages();
}


// Display current question
function displayQuestion(index) {
  const question = quizQuestions[index]
  questionNumber.textContent = `Question ${index + 1}/${quizQuestions.length}`
  difficultyLevel.textContent = question.difficulty
  questionText.textContent = question.question

  // Set difficulty color
  switch (question.difficulty.toLowerCase()) {
    case "easy":
      difficultyLevel.style.color = "#2ecc71"
      break
    case "medium":
      difficultyLevel.style.color = "#e67e22"
      break
    case "hard":
      difficultyLevel.style.color = "#e74c3c"
      break
  }

  // Clear options container
  optionsContainer.innerHTML = ""

  // Add options with animation delay
  const optionLetters = ["A", "B", "C", "D"]
  question.options.forEach((option, i) => {
    const optionElement = document.createElement("div")
    optionElement.className = "option"
    optionElement.style.animation = `fadeIn 0.3s ease-out ${i * 0.1}s both`

    const letterSpan = document.createElement("span")
    letterSpan.className = "option-letter"
    letterSpan.textContent = optionLetters[i]

    const optionText = document.createElement("span")
    optionText.textContent = option

    optionElement.appendChild(letterSpan)
    optionElement.appendChild(optionText)
    optionElement.dataset.index = i

    // Check if this question has been answered
    const isAnswered = answeredQuestions.has(index)

    if (!isAnswered) {
      optionElement.addEventListener("click", () => selectOption(i, optionElement))
    } else {
      optionElement.classList.add("answered")

      // If this was the selected option for this question, mark it as selected
      const userAnswer = userAnswers.find((answer) => answer.questionIndex === index)
      if (userAnswer && userAnswer.selectedOptionIndex === i) {
        optionElement.classList.add("selected")
      }
    }

    optionsContainer.appendChild(optionElement)
  })

  // Reset question state if not answered
  if (!answeredQuestions.has(index)) {
    selectedOptionIndex = null
    submitAnswerBtn.disabled = true
  } else {
    submitAnswerBtn.disabled = false
  }

  // Always show "Submit Answer" text
  submitAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Submit Answer'

  // Start capturing images if not already answered
  if (!answeredQuestions.has(index)) {
    startCapturingImages()
  } else {
    stopCapturingImages()
  }
}

// Select an option
function selectOption(index, optionElement) {
  if (answeredQuestions.has(currentQuestionIndex)) return

  // Clear previous selection
  const options = optionsContainer.querySelectorAll(".option")
  options.forEach((option) => option.classList.remove("selected"))

  // Set new selection
  optionElement.classList.add("selected")
  selectedOptionIndex = index
  submitAnswerBtn.disabled = false
}

// Submit answer
async function submitAnswer() {
  if (selectedOptionIndex === null || answeredQuestions.has(currentQuestionIndex)) return

  // Stop capturing images
  stopCapturingImages()

  // Show loading state
  submitAnswerBtn.disabled = true
  submitAnswerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'

  // Record user answer
  const currentQuestion = quizQuestions[currentQuestionIndex]
  const isCorrect = selectedOptionIndex === currentQuestion.correctIndex

  userAnswers.push({
    questionIndex: currentQuestionIndex,
    selectedOptionIndex: selectedOptionIndex,
    isCorrect: isCorrect,
  })

  if (isCorrect) {
    score++
  }

  // Mark question as answered
  answeredQuestions.add(currentQuestionIndex)

  // Submit captured images to backend
  await submitCapturedImages(currentQuestionIndex, isCorrect)

  // Move to next question if available
  if (currentQuestionIndex < quizQuestions.length - 1) {
    // Determine next question difficulty based on performance
    const nextDifficulty = determineNextQuestionDifficulty(isCorrect, currentQuestion.difficulty)

    // Fetch next question based on performance
    await fetchNextQuestion(nextDifficulty)

    // Move to next question
    currentQuestionIndex++

    // Display next question
    displayQuestion(currentQuestionIndex)
  } else {
    // If this was the last question, just reset the button
    submitAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Submit Answer'
    submitAnswerBtn.disabled = false

    // Mark options as answered
    const options = optionsContainer.querySelectorAll(".option")
    options.forEach((option) => {
      option.classList.add("answered")
      option.style.cursor = "default"
    })

    // Highlight submit exam button
    submitExamBtn.classList.add("pulse-animation")
  }
}

// Submit captured images to backend
async function submitCapturedImages(questionIndex, isCorrect) {
  try {
    const payload = {
      questionIndex: questionIndex,
      images: capturedImages,
      isCorrect: isCorrect,
    }

    // In a real application, you would send this data to your backend
    console.log(`Submitting ${capturedImages.length} images to backend for question ${questionIndex + 1}`)
    console.log(capturedImages)

    // Mock API call with delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const response = await fetch(API_ENDPOINTS.SUBMIT_IMAGES, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      questionText.textContent = data.next_question.question;
      console.log("Response from backend:", data)
    })

    
    
    // Clear captured images
    capturedImages = []

    return true
  } catch (error) {
    console.error("Error submitting images:", error)
    return false
  }
}

// Determine next question difficulty based on performance
function determineNextQuestionDifficulty(isCorrect, currentDifficulty) {
  if (isCorrect) {
    // If correct, increase difficulty
    switch (currentDifficulty.toLowerCase()) {
      case "easy":
        return "medium"
      case "medium":
      case "hard":
        return "hard"
    }
  } else {
    // If incorrect, decrease difficulty
    switch (currentDifficulty.toLowerCase()) {
      case "hard":
        return "medium"
      case "medium":
      case "easy":
        return "easy"
    }
  }

  return "medium" // Default
}

// Fetch next question based on difficulty
async function fetchNextQuestion(difficulty) {
  // In a real application, you would fetch the next question from the backend
  // For demo purposes, we'll just use the existing questions
  console.log(`Fetching next question with difficulty: ${difficulty}`)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return true
}

// Finish the quiz and show results
async function finishQuiz() {
  // Check if at least one question has been answered
  if (userAnswers.length === 0) {
    alert("Please answer at least one question before submitting the exam.")
    return
  }

  // Show loading state
  submitExamBtn.disabled = true
  submitExamBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...'

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Stop webcam
  if (webcamStream) {
    webcamStream.getTracks().forEach((track) => track.stop())
    webcamStream = null
  }

  // Hide webcam container and submit exam button
  webcamContainer.classList.add("hidden")
  submitExamContainer.classList.add("hidden")

  // Hide quiz screen and show results screen
  quizScreen.classList.add("hidden")
  resultsScreen.classList.remove("hidden")

  // Display score
  finalScore.textContent = `${score}/${quizQuestions.length}`

  // Display results details with animation
  resultsDetails.innerHTML = ""
  userAnswers.forEach((answer, index) => {
    const question = quizQuestions[answer.questionIndex]
    const resultItem = document.createElement("div")
    resultItem.className = "result-item"
    resultItem.style.animation = `fadeIn 0.3s ease-out ${index * 0.1}s both`

    const resultQuestion = document.createElement("div")
    resultQuestion.className = "result-question"
    resultQuestion.textContent = `Q${answer.questionIndex + 1}: ${question.question}`

    const resultAnswer = document.createElement("div")
    resultAnswer.className = `result-answer ${answer.isCorrect ? "correct" : "incorrect"}`

    const resultIcon = document.createElement("span")
    resultIcon.className = `result-icon ${answer.isCorrect ? "correct" : "incorrect"}`
    resultIcon.innerHTML = answer.isCorrect ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'

    const resultText = document.createElement("span")
    resultText.textContent = answer.isCorrect ? "Correct" : "Incorrect"

    resultAnswer.appendChild(resultIcon)
    resultAnswer.appendChild(resultText)

    resultItem.appendChild(resultQuestion)
    resultItem.appendChild(resultAnswer)
    resultsDetails.appendChild(resultItem)
  })

  // Get final score from API
  getFinalScore()
}

// Get final score from API
async function getFinalScore() {
  try {
    // In a real application, you would fetch the final score from the backend
    console.log("Fetching final score from API")

    // Mock API call
    // const response = await fetch(API_ENDPOINTS.GET_SCORE, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         answers: userAnswers
    //     })
    // });

    return true
  } catch (error) {
    console.error("Error getting final score:", error)
    return false
  }
}

// Restart quiz
function restartQuiz() {
  // Reset quiz state
  currentQuestionIndex = 0
  selectedOptionIndex = null
  score = 0
  userAnswers = []
  answeredQuestions = new Set()

  // Show welcome screen
  resultsScreen.classList.add("hidden")
  welcomeScreen.classList.remove("hidden")

  // Reset submit exam button
  submitExamBtn.disabled = false
  submitExamBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Exam'
}

// Mock questions for demo purposes
function getMockQuestions() {
  return [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctIndex: 2,
      difficulty: "Easy",
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctIndex: 1,
      difficulty: "Easy",
    },
    {
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correctIndex: 2,
      difficulty: "Medium",
    },
    {
      question: "Which of these is NOT a programming language?",
      options: ["Java", "Python", "Cobra", "Crocodile"],
      correctIndex: 3,
      difficulty: "Medium",
    },
    {
      question: "What is the value of π (pi) to two decimal places?",
      options: ["3.14", "3.15", "3.16", "3.17"],
      correctIndex: 0,
      difficulty: "Medium",
    },
    {
      question: "Which of the following is a non-metal that remains liquid at room temperature?",
      options: ["Phosphorus", "Bromine", "Chlorine", "Helium"],
      correctIndex: 1,
      difficulty: "Hard",
    },
    {
      question: "In which year was the first iPhone released?",
      options: ["2005", "2006", "2007", "2008"],
      correctIndex: 2,
      difficulty: "Medium",
    },
    {
      question: "What is the time complexity of binary search algorithm?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
      correctIndex: 1,
      difficulty: "Hard",
    },
    {
      question: "Which of these countries is NOT in Africa?",
      options: ["Suriname", "Senegal", "Somalia", "Sierra Leone"],
      correctIndex: 0,
      difficulty: "Hard",
    },
    {
      question: "What is the main component of the Sun?",
      options: ["Oxygen", "Helium", "Hydrogen", "Carbon"],
      correctIndex: 2,
      difficulty: "Medium",
    },
  ]
}

// Add CSS for loading overlay
const style = document.createElement("style")
style.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 20px;
    }
    
    @keyframes pulse-animation {
        0% {
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
        }
    }
    
    .pulse-animation {
        animation: pulse-animation 2s infinite;
    }
`
document.head.appendChild(style)

// Add a global error handler to clean up any stuck loading overlays
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error)

  // Clean up any loading overlays
  const loadingEl = document.querySelector(".loading-overlay")
  if (loadingEl && document.body.contains(loadingEl)) {
    document.body.removeChild(loadingEl)
  }

  // Reset any loading buttons
  if (startQuizBtn) {
    startQuizBtn.innerHTML = '<i class="fas fa-play"></i> Start Quiz'
    startQuizBtn.disabled = false
  }

  if (submitAnswerBtn) {
    submitAnswerBtn.innerHTML = '<i class="fas fa-check"></i> Submit Answer'
    submitAnswerBtn.disabled = false
  }

  if (submitExamBtn) {
    submitExamBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Exam'
    submitExamBtn.disabled = false
  }
})

// Initialize the quiz when the page loads
document.addEventListener("DOMContentLoaded", initQuiz)
