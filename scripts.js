function check_user() {
    let user = document.getElementById('user').innerHTML;
    return user;
}

function change_user() {
    let user = check_user();
    if (user === "X") {
        document.getElementById('user').innerHTML = "O";
    } else {
        document.getElementById('user').innerHTML = "X";
    }
}
function closeAlert() {
    const resultBox = document.getElementById('result-box');
    resultBox.style.display = "none"; 
}

function fun(cell) {
    let user = check_user();
    console.log(user);
    cell.innerHTML = user;
    cell.style.pointerEvents = "none";  // Disable the cell after clicking
    checkWinner();
    change_user();
}

function checkWinner() {
    const cells = document.getElementsByClassName('cell');
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6]              
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (cells[a].innerHTML && cells[a].innerHTML === cells[b].innerHTML && cells[a].innerHTML === cells[c].innerHTML) {
            const winner = cells[a].innerHTML;
            if (winner === 'X') {
                let playerScore = document.getElementById('mark-1');
                playerScore.innerHTML = parseInt(playerScore.innerHTML) + 1;
            } else {
                let playerScore = document.getElementById('mark-2');
                playerScore.innerHTML = parseInt(playerScore.innerHTML) + 1;
            }
            displayResult(`Win ${winner} Player`, `${winner} player win`, "green");
            resetBoard();
            return;
        }
    }

    if (Array.from(cells).every(cell => cell.innerHTML !== "")) {
        displayResult("Draw!", "It's a draw!", "orange");
        resetBoard();
    }
}
       
function displayResult(message, description, color) {
    const resultBox = document.getElementById('result-box');
    resultBox.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show h-100" role="alert">
            <strong><h1 id="result-message">${message}</h1></strong> <span id="result-description">${description}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onclick="closeAlert()"></button>
        </div>`;
    resultBox.style.color = color;
    resultBox.style.display = "block"; 
  }

function resetBoard() {
    const cells = document.querySelectorAll('.xox .cell');
    for (let cell of cells) {
        cell.innerHTML = "";
        cell.style.pointerEvents = "auto";  // Re-enable the cell
    }
    document.getElementById('user').innerHTML = "X";
}
function toggleScoreBoard() {
    const scoreBoardContent = document.getElementById('score-board-content');
    const scoreDisplay =document.getElementById('score-display');
    if (scoreBoardContent.style.display === "none" || scoreBoardContent.style.display === "") {
        scoreBoardContent.style.display = "block";
        scoreDisplay.innerHTML='<i class="fa fa-close" style="font-size:48px;color:red" onclick="toggleScoreBoard()"></i>';
    } else {
        scoreBoardContent.style.display = "none";
        scoreDisplay.innerHTML='<i class="fa fa-trophy" style="font-size:48px;color:rgb(255, 242, 0)" onclick="toggleScoreBoard()"></i>';
    }
}
