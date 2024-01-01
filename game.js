const question = document.getElementById("question");
const choice = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader =  document.getElementById("loader");
const game = document.getElementById("game");
let currentQuestion = {};
let acceptingAnswer = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];
fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple").then( res => {
    return res.json();
}).then(loadedQuestions =>{
    questions = loadedQuestions.results.map( loadedQuestion =>{
        const formattedQuestion = { question: loadedQuestion.question};
        const answerChoices = [...loadedQuestion.incorrect_answers];
        formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
        answerChoices.splice(formattedQuestion.answer - 1, 0, loadedQuestion.correct_answer);
        answerChoices.forEach((choice , index) => {
            formattedQuestion["choice" + (index + 1)] = choice;
        })
        return formattedQuestion;
    });
    Startgame();
});

const correctBonus = 15;
const maxQuestions = 10;

Startgame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    console.log(availableQuestions);
    getNewQuestion();
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

getNewQuestion = () => {
    if (availableQuestions.length === 0 || questionCounter >= maxQuestions) {
        localStorage.setItem("mostRecentScore" , score);
        return window.location.assign("end.html");
    }

    questionCounter++;
    progressText.innerText ="Question " + questionCounter + "/" + maxQuestions;
    progressBarFull.style.width = `${(questionCounter/maxQuestions) * 100}%`;
    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    const decoder = new DOMParser();
    const decodedQuestion = decoder.parseFromString(currentQuestion.question, 'text/html').body.textContent;
    question.innerHTML = decodedQuestion;

    choice.forEach(choice => {
        const number = choice.dataset["number"];
        const decodedChoice = decoder.parseFromString(currentQuestion["choice" + number], "text/html").body.textContent;
        choice.innerText = decodedChoice;
    });

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswer = true;
};

choice.forEach(choice => {
    choice.addEventListener("click", e => {
        if (!acceptingAnswer) return;

        acceptingAnswer = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];
        let classtoApply = 'incorrect';
        if (selectedAnswer == currentQuestion.answer) {
            classtoApply = 'correct';
        }
        if(classtoApply=="correct")
        {
            incrementScore(correctBonus);
        }
        selectedChoice.parentElement.classList.add(classtoApply);
        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classtoApply);
            getNewQuestion();
        }, 1000);
    });
});

incrementScore = num =>{
    score += num;
    scoreText.innerText = score;
}
