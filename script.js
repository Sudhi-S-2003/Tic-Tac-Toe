// --- BROWSER UTILS --- //
function generateUUID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// --- CORE GAME LOGIC --- //
class Player {
    constructor(playerName = "", playerNo = "") {
        if (typeof playerName !== "string") throw new Error("playerName must be a string");
        this.playerNo = playerNo || generateUUID();
        this.playerName = playerName;
    }
}

class Cell {
    constructor(colNo, rowNo) {
        if (typeof colNo !== "number" || typeof rowNo !== "number") throw new Error("colNo and rowNo must be valid numbers");
        this.colNo = colNo;
        this.rowNo = rowNo;
        this.content = "";
    }
    addContent = (content) => {
        if (content !== "x" && content !== "o") throw new Error("Cell content must be exactly 'x' or 'o'");
        this.content = content;
    }
}

class Board {
    constructor() { this.cells = []; }
    addCells = (cell) => {
        if (!(cell instanceof Cell)) throw new Error("cell must be an instance of Cell");
        const isDuplicate = this.cells.some(c => c.colNo === cell.colNo && c.rowNo === cell.rowNo);
        if (isDuplicate) throw new Error(`Cell at col ${cell.colNo}, row ${cell.rowNo} is already present`);
        this.cells.push(cell);
    }
}

class Game {
    startGame = (player1, player2) => {
        if (!(player1 instanceof Player) || !(player2 instanceof Player)) throw new Error("player1 or player2 is not an instance of Player");
        if (player1 === player2) throw new Error("player1 and player2 cannot be the same instance");
        
        this.player1 = player1;
        this.player1Content = "x";
        this.player2 = player2;
        this.player2Content = "o";
        this.winner = null; 
        this.initGame();
    }
    
    initGame = () => {
        const cells = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]];
        const board = new Board();
        cells.forEach(cell => {
            const [colNo, rowNo] = cell;
            board.addCells(new Cell(colNo, rowNo));
        });
        this.board = board;
        this.currentPlayer = this.player1;
        this.currentPlayerContent = this.player1Content;
    }
    
    getCurrentPlayer = () => {
        if (this.currentPlayer === this.player1) return { currentPlayer: "player1", player: this.player1 };
        else if (this.currentPlayer === this.player2) return { currentPlayer: "player2", player: this.player2 };
        else throw new Error("Invalid Player state");
    }

    checkStats = () => {
        const board = this.board.cells;
        const get = (c, r) => this.getCell(c, r).content;

        const wins = [
            { cells: [get(0, 0), get(1, 0), get(2, 0)], lineClass: 'win-row-1' },
            { cells: [get(0, 1), get(1, 1), get(2, 1)], lineClass: 'win-row-2' },
            { cells: [get(0, 2), get(1, 2), get(2, 2)], lineClass: 'win-row-3' },
            { cells: [get(0, 0), get(0, 1), get(0, 2)], lineClass: 'win-col-1' },
            { cells: [get(1, 0), get(1, 1), get(1, 2)], lineClass: 'win-col-2' },
            { cells: [get(2, 0), get(2, 1), get(2, 2)], lineClass: 'win-col-3' },
            { cells: [get(0, 0), get(1, 1), get(2, 2)], lineClass: 'win-diag-1' },
            { cells: [get(2, 0), get(1, 1), get(0, 2)], lineClass: 'win-diag-2' }
        ];

        let winContent = null;
        let winClass = null;

        const isWin = wins.some(line => {
            if (line.cells[0] && line.cells[0] === line.cells[1] && line.cells[1] === line.cells[2]) {
                winContent = line.cells[0];
                winClass = line.lineClass;
                return true;
            }
            return false;
        });
        
        const isCompleted = board.every(cell => cell.content !== "") || isWin;
        const winPlayer = winContent ? (winContent === this.player1Content ? this.player1 : this.player2) : null;
        
        return { isWin, isCompleted, winContent, winPlayer, winClass };
    }
    
    play = (player, cell) => {
        if (this.winner || this.checkStats().isCompleted) throw new Error("The game is already over");
        if (player !== this.currentPlayer) throw new Error("It is not this player's turn");
        if (cell.content !== "") throw new Error("Cell is not vacant");

        cell.addContent(this.currentPlayerContent);
        const stats = this.checkStats();
        
        if (stats.winPlayer instanceof Player || stats.isCompleted) {
            if (stats.winPlayer) this.winner = stats.winPlayer;
            return { stats };
        }
        
        const previousPlayer = this.getCurrentPlayer();
        this.currentPlayer = previousPlayer.currentPlayer === "player1" ? this.player2 : this.player1;
        this.currentPlayerContent = previousPlayer.currentPlayer === "player1" ? this.player2Content : this.player1Content;
    }
    
    getCell = (colNo, rowNo) => {
        const cell = this.board.cells.find(c => c.colNo === colNo && c.rowNo === rowNo);
        if (cell instanceof Cell) return cell;
        throw new Error("Cell not found on board");
    }
}

class Chapters {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.chapterCount = 1;
        this.scores = { [player1.playerName]: 0, [player2.playerName]: 0, draws: 0 };
    }

    recordResult(stats) {
        if (!stats) return;
        if (stats.isWin && stats.winPlayer instanceof Player) {
            this.scores[stats.winPlayer.playerName]++;
        } else if (stats.isCompleted) {
            this.scores.draws++;
        }
    }
}

// --- DOM MANIPULATION & UI LOGIC --- //

const setupContainer = document.getElementById("setup-container");
const gameContainer = document.getElementById("game-container");
const p1Input = document.getElementById("p1-input");
const p2Input = document.getElementById("p2-input");
const startBtn = document.getElementById("start-btn");

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status-text");
const chapterTitleEl = document.getElementById("chapter-title");
const nextChapterBtn = document.getElementById("next-chapter-btn");
const resetBtn = document.getElementById("reset-btn");
const restartBtn = document.getElementById("restart-btn");

const p1ScoreEl = document.getElementById("player1-score");
const p2ScoreEl = document.getElementById("player2-score");
const drawScoreEl = document.getElementById("draw-score");

let player1, player2, tournament, currentGame;

startBtn.addEventListener("click", () => {
    const p1Name = p1Input.value.trim() || "Player 1";
    const p2Name = p2Input.value.trim() || "Player 2";

    player1 = new Player(p1Name);
    player2 = new Player(p2Name);
    tournament = new Chapters(player1, player2);
    
    document.getElementById("player1-name").innerText = `${player1.playerName} (X)`;
    document.getElementById("player2-name").innerText = `${player2.playerName} (O)`;
    updateScoreboard();

    setupContainer.classList.add("hidden");
    gameContainer.classList.remove("hidden");

    startChapter();
});

nextChapterBtn.addEventListener("click", () => {
    tournament.chapterCount++;
    startChapter();
});

resetBtn.addEventListener("click", () => {
    startChapter();
});

restartBtn.addEventListener("click", () => {
    gameContainer.classList.add("hidden");
    setupContainer.classList.remove("hidden");
    p1Input.value = "";
    p2Input.value = "";
});

function startChapter() {
    nextChapterBtn.classList.add("hidden");
    chapterTitleEl.innerText = `Chapter ${tournament.chapterCount}`;
    
    currentGame = new Game();
    currentGame.startGame(tournament.player1, tournament.player2);
    
    updateStatusText();
    renderBoard();
}

function renderBoard() {
    boardEl.innerHTML = ""; 
    
    const sortedCells = [...currentGame.board.cells].sort((a, b) => {
        if (a.rowNo === b.rowNo) return a.colNo - b.colNo;
        return a.rowNo - b.rowNo;
    });

    sortedCells.forEach(cell => {
        const cellEl = document.createElement("div");
        cellEl.classList.add("cell");

        // --- ADD THESE TWO LINES ---
        // This explicitly locks each cell into its correct grid position
        cellEl.style.gridColumn = cell.colNo + 1;
        cellEl.style.gridRow = cell.rowNo + 1;
        // ---------------------------

        if (cell.content) {
            cellEl.classList.add(cell.content);
            cellEl.classList.add("taken");
            cellEl.innerText = cell.content.toUpperCase();
        }

        cellEl.addEventListener("click", () => handleCellClick(cell.colNo, cell.rowNo));
        boardEl.appendChild(cellEl);
    });
}

function handleCellClick(colNo, rowNo) {
    if (currentGame.winner || currentGame.checkStats().isCompleted) return;
    
    const cell = currentGame.getCell(colNo, rowNo);
    if (cell.content !== "") return; 

    try {
        const result = currentGame.play(currentGame.currentPlayer, cell);
        renderBoard();

        if (result && result.stats) {
            handleGameEnd(result.stats);
        } else {
            updateStatusText();
        }
    } catch (error) {
        console.error("Game Error:", error.message);
    }
}

function updateStatusText() {
    statusEl.innerText = `${currentGame.currentPlayer.playerName}'s turn (${currentGame.currentPlayerContent.toUpperCase()})`;
    statusEl.style.color = currentGame.currentPlayerContent === "x" ? "var(--x-color)" : "var(--o-color)";
}

function handleGameEnd(stats) {
    tournament.recordResult(stats);
    updateScoreboard();

    statusEl.style.color = "var(--primary-color)";
    if (stats.isWin) {
        statusEl.innerText = `🎉 Congratulations! ${stats.winPlayer.playerName} wins Chapter ${tournament.chapterCount}!`;
        
        // --- DRAW THE WIN LINE ---
        if (stats.winClass) {
            const lineEl = document.createElement("div");
            lineEl.classList.add("win-line", stats.winClass);
            lineEl.style.backgroundColor = stats.winContent === "x" ? "var(--x-color)" : "var(--o-color)";
            boardEl.appendChild(lineEl);
        }

    } else {
        statusEl.innerText = "🤝 It's a draw!";
    }

    nextChapterBtn.classList.remove("hidden");
}

function updateScoreboard() {
    p1ScoreEl.innerText = tournament.scores[player1.playerName];
    p2ScoreEl.innerText = tournament.scores[player2.playerName];
    drawScoreEl.innerText = tournament.scores.draws;
}