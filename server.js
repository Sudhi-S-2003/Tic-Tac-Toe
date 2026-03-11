// tic tac toe terminal game
const { randomUUID } = require("crypto");
const readline = require("readline");

class Player {
    constructor(playerName = "", playerNo = "") {
        if (typeof playerName !== "string") {
            throw new Error("playerName must be a string");
        }
        this.playerNo = playerNo || randomUUID();
        this.playerName = playerName;
    }
}

class Cell {
    constructor(colNo, rowNo) {
        if (typeof colNo !== "number" || typeof rowNo !== "number") {
            throw new Error("colNo and rowNo must be valid numbers");
        }
        this.colNo = colNo;
        this.rowNo = rowNo;
        this.content = "";
    }
    addContent = (content) => {
        if (content !== "x" && content !== "o") {
            throw new Error("Cell content must be exactly 'x' or 'o'");
        }
        this.content = content;
    }
}

class Board {
    constructor() {
        this.cells = [];
    }
    addCells = (cell) => {
        if (!(cell instanceof Cell)) {
            throw new Error("cell must be an instance of Cell");
        }
        // Check if a cell at these coordinates already exists
        const isDuplicate = this.cells.some(c => c.colNo === cell.colNo && c.rowNo === cell.rowNo);
        if (isDuplicate) {
            throw new Error(`Cell at col ${cell.colNo}, row ${cell.rowNo} is already present`);
        }
        this.cells.push(cell);
    }
}

class Game {
    startGame = (player1, player2) => {
        if (!(player1 instanceof Player) || !(player2 instanceof Player)) {
            throw new Error("player1 or player2 is not an instance of Player");
        }
        if (player1 === player2) {
            throw new Error("player1 and player2 cannot be the same instance");
        }
        
        this.player1 = player1;
        this.player1Content = "x";
        this.player2 = player2;
        this.player2Content = "o";
        this.winner = null; // Track the winner globally for the game instance
        this.initGame();
    }
    
    initGame = () => {
        const cells = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
        const board = new Board();
        cells.map(cell => {
            const [colNo, rowNo] = cell;
            const newCell = new Cell(colNo, rowNo);
            board.addCells(newCell);
        });
        this.board = board;
        this.currentPlayer = this.player1;
        this.currentPlayerContent = this.player1Content;
    }
    
    getCurrentPlayer = () => {
        if (this.currentPlayer === this.player1) {
            return {
                currentPlayer: "player1",
                player: this.player1
            };
        } else if (this.currentPlayer === this.player2) {
            return {
                currentPlayer: "player2",
                player: this.player2
            };
        } else {
            throw new Error("Invalid Player state");
        }
    }

    checkStats = () => {
        const board = this.board.cells;
        const get = (c, r) => this.getCell(c, r).content;

        const wins = [
            [get(0, 0), get(0, 1), get(0, 2)],
            [get(1, 0), get(1, 1), get(1, 2)],
            [get(2, 0), get(2, 1), get(2, 2)],

            [get(0, 0), get(1, 0), get(2, 0)],
            [get(0, 1), get(1, 1), get(2, 1)],
            [get(0, 2), get(1, 2), get(2, 2)],

            [get(0, 0), get(1, 1), get(2, 2)],
            [get(0, 2), get(1, 1), get(2, 0)]
        ];

        let winContent = null;
        const isWin = wins.some(line => {
            if (line[0] && line[0] === line[1] && line[1] === line[2]) {
                winContent = line[0];
                return true;
            }
            return false;
        });
        
        const isCompleted = board.every(cell => cell.content !== "") || isWin;
        const winPlayer = winContent ? (winContent === this.player1Content ? this.player1 : this.player2) : null;
        
        return {
            isWin,
            isCompleted,
            winContent,
            winPlayer
        };
    }
    
    play = (player, cell) => {
        if (!(player instanceof Player) || !(cell instanceof Cell)) {
            throw new Error("player or cell is not a valid instance");
        }
        if (this.winner || this.checkStats().isCompleted) {
            throw new Error("The game is already over");
        }
        if (player !== this.currentPlayer) {
            throw new Error("It is not this player's turn");
        }
        if (cell.content !== "") {
            throw new Error("Cell is not vacant");
        }

        // Use the validated addContent method
        cell.addContent(this.currentPlayerContent);
        const stats = this.checkStats();
        
        // Return stats if there is a winner OR if the board is full (draw)
        if (stats.winPlayer instanceof Player || stats.isCompleted) {
            if (stats.winPlayer) this.winner = stats.winPlayer;
            return { stats };
        }
        
        const previousPlayer = this.getCurrentPlayer();
        const nextplayer = previousPlayer.currentPlayer === "player1" ? this.player2 : this.player1;
        const currentPlayerContent = previousPlayer.currentPlayer === "player1" ? this.player2Content : this.player1Content;

        this.currentPlayer = nextplayer;
        this.currentPlayerContent = currentPlayerContent;
    }
    
    getCell = (colNo, rowNo) => {
        if (typeof colNo !== "number" || typeof rowNo !== "number") {
            throw new Error("colNo and rowNo must be numbers");
        }
        if (colNo < 0 || colNo > 2 || rowNo < 0 || rowNo > 2) {
            throw new Error("Coordinates out of bounds (must be 0, 1, or 2)");
        }

        const cell = this.board.cells.find(c => c.colNo === colNo && c.rowNo === rowNo);
        if (cell instanceof Cell) {
            return cell;
        } else {
            throw new Error("Cell not found on board");
        }
    }

    printBoard = () => {
        console.log("\n   0   1   2  (Col)");
        for (let r = 0; r < 3; r++) {
            let rowStr = `${r} `;
            for (let c = 0; c < 3; c++) {
                let content = this.getCell(c, r).content;
                rowStr += `[${content ? content : " "}] `;
            }
            console.log(rowStr);
        }
        console.log("(Row)\n");
    }
}

// --- CHAPTERS LOGIC --- //

class Chapters {
    constructor(player1, player2) {
        if (!(player1 instanceof Player) || !(player2 instanceof Player)) {
            throw new Error("Both participants must be instances of Player");
        }
        if (player1 === player2) {
            throw new Error("player1 and player2 cannot be the same instance");
        }

        this.player1 = player1;
        this.player2 = player2;
        this.chapterCount = 1;
        
        // Track the overall score
        this.scores = {
            [player1.playerName]: 0,
            [player2.playerName]: 0,
            draws: 0
        };
    }

    recordResult(stats) {
        if (!stats) return;
        
        if (stats.isWin && stats.winPlayer instanceof Player) {
            this.scores[stats.winPlayer.playerName]++;
        } else if (stats.isCompleted) {
            this.scores.draws++;
        }
    }

    printScoreboard() {
        console.log("\n=========================");
        console.log("      SCOREBOARD         ");
        console.log("=========================");
        console.log(`${this.player1.playerName}: ${this.scores[this.player1.playerName]} wins`);
        console.log(`${this.player2.playerName}: ${this.scores[this.player2.playerName]} wins`);
        console.log(`Draws: ${this.scores.draws}`);
        console.log("=========================\n");
    }
}


// --- TERMINAL PLAY LOGIC --- //

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askForMove(game, tournament) {
    game.printBoard();
    const player = game.currentPlayer;
    
    rl.question(`${player.playerName}'s turn (${game.currentPlayerContent}). Enter col and row (e.g. '0 0'): `, (input) => {
        const parts = input.trim().split(" ");
        
        if (parts.length !== 2) {
            console.log("⚠️ Invalid input! Please enter column and row separated by a space.");
            return askForMove(game, tournament);
        }

        const col = parseInt(parts[0]);
        const row = parseInt(parts[1]);

        // Added NaN validation
        if (isNaN(col) || isNaN(row)) {
            console.log("⚠️ Invalid input! Please enter valid numbers.");
            return askForMove(game, tournament);
        }

        try {
            const cell = game.getCell(col, row);
            const result = game.play(player, cell);

            // If the game has ended
            if (result && result.stats) {
                game.printBoard(); 
                if (result.stats.isWin) {
                    console.log(`🎉 Congratulations! ${result.stats.winPlayer.playerName} wins Chapter ${tournament.chapterCount}!`);
                } else if (result.stats.isCompleted) {
                    console.log("🤝 It's a draw!");
                }

                // Update and show the scoreboard
                tournament.recordResult(result.stats);
                tournament.printScoreboard();
                
                // Ask to play again
                return askToContinue(tournament);
            }
        } catch (error) {
            console.log(`⚠️ Error: ${error.message}. Try again!`);
        }

        askForMove(game, tournament);
    });
}

function askToContinue(tournament) {
    rl.question(`Play Chapter ${tournament.chapterCount + 1}? (y/n): `, (answer) => {
        if (answer.toLowerCase().startsWith('y')) {
            tournament.chapterCount++;
            startChapter(tournament);
        } else {
            console.log("\nThanks for playing! Final results are above. Goodbye! 👋\n");
            rl.close();
        }
    });
}

function startChapter(tournament) {
    console.log(`\n--- Starting Chapter ${tournament.chapterCount} ---`);
    const game = new Game();
    game.startGame(tournament.player1, tournament.player2);
    askForMove(game, tournament);
}

// Start the terminal application
try {
    const player1 = new Player("Alice");
    const player2 = new Player("Bob");
    const tournament = new Chapters(player1, player2);

    console.log("Welcome to Terminal Tic Tac Toe!");
    startChapter(tournament);
} catch (error) {
    console.log(`🚨 Initialization Error: ${error.message}`);
    process.exit(1);
}