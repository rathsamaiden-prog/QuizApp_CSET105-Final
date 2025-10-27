const startingMinutes = 20;
let time = startingMinutes * 60;
const timerElement = document.getElementById('timer');

setInterval(updateTimer, 1000);

function updateTimer() {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;  
    seconds = seconds < 10 ? '0' + seconds : seconds;
    timerElement.innerHTML = `${minutes}:${seconds}`;
    time--;
}

const answerButtons = document.querySelectorAll('.answer-button'); 

answerButtons.forEach(button => {
    button.addEventListener('click', function() {
        const isCorrect = this.dataset.correct === 'true';
        if (isCorrect) {
            this.style.backgroundColor = 'green';
        } else {
            this.style.backgroundColor = 'red';
        }
    });
});