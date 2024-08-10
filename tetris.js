// Game constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

// Tetromino shapes
const SHAPES = [
    [], // Empty shape for easier indexing
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1], [1, 1]], // O
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]] // Z
];

// Game variables
let board;
let currentPiece;
let currentX;
let currentY;
let gameLoop;
let dropInterval = 1000; // Time in ms between automatic drops

// Initialize the game
function init() {
    // Create the game board
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    
    // Create the game board in the DOM
    const gameBoard = document.querySelector('.game-board');
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.width = `${BLOCK_SIZE}px`;
            cell.style.height = `${BLOCK_SIZE}px`;
            gameBoard.appendChild(cell);
        }
    }
    
    // Start the game
    newPiece();
    draw();
    gameLoop = setInterval(drop, dropInterval);

    // Add keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Create a new piece
function newPiece() {
    const shapeIndex = Math.floor(Math.random() * 7) + 1;
    currentPiece = SHAPES[shapeIndex];
    currentX = Math.floor(COLS / 2) - Math.ceil(currentPiece[0].length / 2);
    currentY = 0;

    if (collision()) {
        // Game over
        clearInterval(gameLoop);
        alert("Game Over!");
    }
}

// Draw the game state
function draw() {
    const cells = document.querySelectorAll('.game-board .cell');
    cells.forEach(cell => cell.className = 'cell');
    
    // Draw the board
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                const index = row * COLS + col;
                cells[index].classList.add('filled', `piece-${board[row][col]}`);
            }
        }
    }
    
    // Draw the current piece
    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const index = (currentY + y) * COLS + (currentX + x);
                cells[index].classList.add('filled', `piece-${value}`);
            }
        });
    });
}

// Check for collision
function collision() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x] &&
                (board[currentY + y] === undefined ||
                 board[currentY + y][currentX + x] === undefined ||
                 board[currentY + y][currentX + x])) {
                return true;
            }
        }
    }
    return false;
}

// Move the piece down
function drop() {
    currentY++;
    if (collision()) {
        currentY--;
        mergePiece();
        newPiece();
    }
    draw();
}

// Merge the piece with the board
function mergePiece() {
    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentY + y][currentX + x] = value;
            }
        });
    });
    clearLines();
}

// Clear completed lines
function clearLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
        }
    }
}

// Rotate the piece
function rotate() {
    const rotated = currentPiece[0].map((_, index) =>
        currentPiece.map(row => row[index]).reverse()
    );
    const previousPiece = currentPiece;
    currentPiece = rotated;
    if (collision()) {
        currentPiece = previousPiece;
    }
}

// Handle keyboard controls
function handleKeyPress(event) {
    switch(event.keyCode) {
        case 37: // Left arrow
            if (!collision()) {
                currentX--;
                if (collision()) {
                    currentX++;
                }
            }
            break;
        case 39: // Right arrow
            currentX++;
            if (collision()) {
                currentX--;
            }
            break;
        case 40: // Down arrow
            drop();
            break;
        case 38: // Up arrow
            rotate();
            break;
    }
    draw();
}

// Initialize the game when the page loads
window.addEventListener('load', init);