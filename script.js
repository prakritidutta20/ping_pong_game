
var gamePort = document.querySelector("#game-view");
var gamePortWidth = gamePort.getBoundingClientRect().width;
var gamePortHeight = gamePort.getBoundingClientRect().height;

var player1CurrentMaxScore = 0;
var player2CurrentMaxScore = 0;
var exitingMaxScore = 0;
var maxWinnerName = "";

//
var gameData = {};
var isPlayingFirstTime = false;

function setGameInformation() {
    gameData = sessionStorage.getItem("gameInfo");
    if (gameData == null || gameData === undefined) {
        isPlayingFirstTime = true;
    } else {
        gameData = JSON.parse(gameData);
        exitingMaxScore = gameData.maxScore;
        maxWinnerName = gameData.playerName;
    }
}

var stick1 = document.getElementById("stick-1");
var stick2 = document.getElementById("stick-2");
var rodProperties = window.getComputedStyle(stick1);
var rodSize = parseInt(rodProperties.width, 10);
var rodWidth = parseInt(rodProperties.height, 10);
var gameSpeed = 50;
var currentPosition = gamePortHeight * 0.5 - rodSize * 0.5;
var ball = document.getElementById("ball");

var keepMoving = true;
var ballMovingInterval;
var horizontalDirection = 1;
var verticalDirection = 1;

var ballProps = window.getComputedStyle(ball);
var ballLeftPos = parseInt(ballProps.left, 10);
var ballSize = parseInt(ballProps.width, 10);
var ballPosition = {
    x: gamePortWidth * 0.5 - ballSize * 0.5,
    y: rodWidth
};

var shiftSpeed = 10;
document.addEventListener("keydown", (event) => {
    handleKeyDown(event);
});

// Function to handle keydown event
function handleKeyDown(event) {
    const key = event.key.toLowerCase(); // Convert the pressed key to lowercase
    let isLeftDirection = true;

    var stickProp = window.getComputedStyle(stick1);
    var stickLeftPos = parseInt(stickProp.left, 10);
    var stickSize = parseInt(stickProp.width, 10);

    if (key === "a") {// to move in left direction
        if (stickLeftPos > shiftSpeed) {
            currentPosition -= shiftSpeed;
        } else if (stickLeftPos) {
            currentPosition = 0;
        }
        // moveLeft(-10);
    } else if (key === "d") {// to move in right direction
        if (stickLeftPos < gamePortWidth - stickSize - shiftSpeed) {
            currentPosition += shiftSpeed;
        } else {
            currentPosition = gamePortWidth - stickSize;
        }
        // currentPosition -= 10;
    } else if (key === "enter") {// for starting the game
        //clear exiting inteval
        setGameInformation();
        if (isPlayingFirstTime) {
            alert("Welcome to Game! This is your First Game.");
        } else {
            alert(
                "Welcome to Game! Max score is " +
                exitingMaxScore +
                " and Scored by " +
                maxWinnerName
            );
        }
        clearInterval(ballMovingInterval);
        keepBallMoving();
    } else if (key === " ") {
        //this is if space is pressed
        clearInterval(ballMovingInterval);
        
        ballPosition.y = gamePortHeight - rodWidth - ballSize;
        ballPosition.x = gamePortWidth * 0.5 - ballSize * 0.5;
        updateBallPosition();

        //reseting sticks to center
        currentPosition = gamePortWidth * 0.5 - rodSize * 0.5;
        updateStickPosition();
    } else {
        console.log(key);
    }

    updateStickPosition();
}

function updateGameData() {
    let currentMaxScore = Math.max(
        player1CurrentMaxScore,
        player2CurrentMaxScore
    );
    let playerName = "Player 2";
    if (player1CurrentMaxScore > player2CurrentMaxScore) {
        playerName = "Player 1";
    }
    if (currentMaxScore > exitingMaxScore) {
        let gameData = {
            maxScore: currentMaxScore,
            playerName: playerName
        };
        exitingMaxScore = currentMaxScore;
        maxWinnerName = playerName;
        isPlayingFirstTime = false;
        sessionStorage.setItem("gameInfo", JSON.stringify(gameData));
    }
}

function updateStickPosition() {
    let shiftProperty = currentPosition + "px";
    stick1.style.left = shiftProperty;
    stick2.style.left = shiftProperty;
}

function keepBallMoving() {
    var stick2Prop = window.getComputedStyle(stick2);
    var stick2TopPos = parseInt(stick2Prop.top, 10);
    var stickSize = parseInt(stick2Prop.width, 10);

    const twoPercentHeight = gamePortHeight * 0.02;
    //console.log(stick2Prop);
    ballMovingInterval = setInterval(function () {

        // change ball direction from left to right
        if (ballPosition.x >= gamePortWidth - ballSize) {
            horizontalDirection = -1;
        } else if (ballPosition.x <= 0) {
            horizontalDirection = 1;
        }

        let isBallInStickRange =
            ballPosition.x >= currentPosition &&
            ballPosition.x <= currentPosition + stickSize;

        //change ball vertical direction
        if (isBallInStickRange && ballPosition.y <= twoPercentHeight) {
            verticalDirection = 1;
        } else if (
            isBallInStickRange &&
            ballPosition.y + ballSize >= stick2TopPos
        ) {
            verticalDirection = -1;
        }

        if (ballPosition.y >= gamePortHeight - ballSize) {
            alert(
                "Congratulations! Player 1 Wins, total Score " +
                (player1CurrentMaxScore + 1)
            );
            resetGame(true);
            clearInterval(ballMovingInterval);
            console.log(ballPosition.y, gamePortHeight, ballSize);
            return;
        } else if (ballPosition.y <= 0) {
            alert(
                "Congratulations! Player 2 Wins, total Score " +
                (player2CurrentMaxScore + 1)
            );
            console.log(ballPosition.y, gamePortHeight, ballSize);
            clearInterval(ballMovingInterval);
            resetGame(false);
            return;
        }

        ballPosition.x += horizontalDirection * 5;
        ballPosition.y += verticalDirection * 5;
        updateBallPosition();
    }, gameSpeed);
}

function resetGame(isFirstPlayerWins) {
    if (isFirstPlayerWins) {
        ballPosition.y = gamePortHeight - rodWidth - ballSize;
        player1CurrentMaxScore++;
    } else {
        ballPosition.y = rodWidth;
        player2CurrentMaxScore++;
    }
    currentPosition = gamePortWidth * 0.5 - rodSize * 0.5;

    ballPosition.x = gamePortWidth * 0.5 - ballSize * 0.5;
    updateBallPosition();
    updateGameData();
    updateStickPosition();
}

function updateBallPosition() {
    ball.style.left = ballPosition.x + "px";
    ball.style.top = ballPosition.y + "px";
}
