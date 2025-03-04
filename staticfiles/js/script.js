// Game configuration


function calculateTimerDuration(score) {
    const baseTime = 2000; // Start with 2 seconds
    const minTime = 1000; // Minimum time of 1 second
    const decreaseRate = 25; // Decrease by 50ms for each point
    
    let calculatedTime = baseTime - (score * decreaseRate);
    return Math.max(calculatedTime, minTime); // Ensure it doesn't go below minTime
}
// const userHighScore = {{ user_high_score }};

// Game state
let score = 0;
let promptTimer;
let currentPrompt;
let previousPrompt
let gameActive = false;

// Available prompts and their corresponding button ids
const prompts = [
    { text: "Pink", buttonId: "btn-pink" },
    { text: "Blue", buttonId: "btn-blue" },
    { text: "Green", buttonId: "btn-green" },
    { text: "Red", buttonId: "btn-red"},
    { text: "BONK IT!", buttonId: "btn-bonk"}
];

// DOM elements
const gameInstructionDiv = document.getElementById("game-instruction");
const navbar = document.getElementById("navbar");
const footer = document.getElementById("footer");
const currentScoreSpan = document.getElementById("current-score");
const startButton = document.getElementById("start-button");
const bonkButton = document.getElementById("btn-bonk")
const playAgainButton = document.getElementById("play-again")
const gameOverModal = new bootstrap.Modal(document.getElementById('game-over-modal'));
const finalScoreSpan = document.getElementById("final-score");
const highScoreForm = document.getElementById("high-score-form");
const userHighScore = parseInt(document.getElementById('high-score').dataset.highScore);
const soundUrl = document.getElementById('soundScript').getAttribute('data-sound-url');
const bonkSound = new Audio(soundUrl);
// const drums = document.getElementById('drums');
// Start game function
function startGame() {
    score = 0;
    gameActive = true;
    updateScore();
    startButton.disabled = true;
    startButton.style.display = "none"
    bonkButton.innerHTML = "Bonk it!"
    gameInstructionDiv.textContent = "Get Ready!"
    previousPrompt = { text: "BONK IT!", buttonId: "btn-bonk"};
    setTimeout(newPrompt, 2000);
    
    // drums.play();
}




// End game function
function endGame() {
    gameActive = false;
    clearTimeout(promptTimer);
    gameInstructionDiv.textContent = "Game Over! Final Score: " + score;
    startButton.disabled = false;
    footer.style.display = "flex";
    navbar.style.display = "block";
    // Update final score displays
    finalScoreSpan.textContent = score;
    document.getElementById("score-input").value = score;
    const highScoreElement = document.getElementById("user-high-score");
    const displayHighScore = isNaN(userHighScore) ? 0 : userHighScore;
    // Show/hide appropriate content based on score
    if (score > displayHighScore) {
        console.log(displayHighScore)
        document.getElementById("high-score-content").style.display = "block";
        document.getElementById("low-score-content").style.display = "none";
        document.getElementById("submit-score").style.display = "block";
        document.getElementById("play-again").style.display = "none";
    } else {
        document.getElementById("high-score-content").style.display = "none";
        document.getElementById("low-score-content").style.display = "block";
        document.getElementById("submit-score").style.display = "none";
        document.getElementById("play-again").style.display = "block";
        document.getElementById("user-high-score").textContent = userHighScore;
        highScoreElement.textContent = displayHighScore;
    }
    startButton.style.display = "flex";
    // drums.pause();
    // Show the Bootstrap modal
    gameOverModal.show();
}



// Generate new prompt
function newPrompt() {
    if (!gameActive) return;
    
    let availablePrompts = prompts.filter(prompt => prompt !== previousPrompt);
    currentPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];

    // document.getElementById(previousPrompt.buttonId).classList.remove('btn-glow');
    previousPrompt = currentPrompt;
    // document.getElementById(currentPrompt.buttonId).classList.add('btn-glow')
    
    gameInstructionDiv.textContent = currentPrompt.text;
    gameInstructionDiv.className = `prompt-${currentPrompt.buttonId}`

    const timerDuration = calculateTimerDuration(score);

    promptTimer = setTimeout(() => {
        if (gameActive) endGame();
    }, timerDuration);
}

// Handle button clicks
function handleButtonClick(buttonId) {
    if (!gameActive) return;
    
    clearTimeout(promptTimer);
    
    if (buttonId === currentPrompt.buttonId) {
        score++;
        updateScore();
        newPrompt();
        if (buttonId === "btn-bonk"){
            bonkSound.currentTime = 0; // Reset audio to start
            bonkSound.play();}
    } else {
        endGame();
    }
}

// Update score display
function updateScore() {
    currentScoreSpan.textContent = score;
}

// Event listeners
startButton.addEventListener("click", function(){
    footer.style.display = "none";
    navbar.style.display = "none";
    incrementTotalGames();
    startGame();
});
document.getElementById('play-again').addEventListener('click', function() {
    let modal = bootstrap.Modal.getInstance(document.getElementById('game-over-modal'));
    footer.style.display = "none";
    navbar.style.display = "none";
    incrementTotalGames();
    modal.hide();
    startGame();
  });

  document.addEventListener('keydown', function(event) {
    switch(event.key.toLowerCase()) {
        case 'q':
            document.getElementById('btn-red').click();
            break;
        case 'w':
            document.getElementById('btn-pink').click();
            break;
        case 'a':
            document.getElementById('btn-blue').click();
            break;
        case 's':
            document.getElementById('btn-green').click();
            break;
    }
});

// Add click listeners to game buttons
prompts.forEach(prompt => {
    document.getElementById(prompt.buttonId).addEventListener("click", () => handleButtonClick(prompt.buttonId));
});

document.getElementById('btn-red').onclick = function() {
    console.log('Q button clicked');
    // Add your desired action here
};

document.getElementById('btn-pink').onclick = function() {
    console.log('W button clicked');
    // Add your desired action here
};

document.getElementById('btn-blue').onclick = function() {
    console.log('A button clicked');
    // Add your desired action here
};

document.getElementById('btn-green').onclick = function() {
    console.log('S button clicked');
    // Add your desired action here
};

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        document.getElementById('btn-bonk').click();
    }
});

function incrementTotalGames(){
    fetch('/game/increment-total-games/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Include CSRF token if using Django
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Total games incremented:', data.total_games);
        // Optionally update the UI to reflect the new total
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

// Function to get CSRF token (if using Django)
function getCookie(name) {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : null;}