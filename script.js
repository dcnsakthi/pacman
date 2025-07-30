// Game configuration
const GAME_CONFIG = {
    BOARD_WIDTH: 19,
    BOARD_HEIGHT: 21,
    INITIAL_LIVES: 3,
    GHOST_SPEED: 300,
    PACMAN_SPEED: 150
};

// Game state
let gameState = {
    board: [],
    pacman: { x: 9, y: 15, direction: 'right' },
    ghosts: [
        { x: 9, y: 9, direction: 'up', color: 'red', id: 'ghost1' },
        { x: 8, y: 9, direction: 'left', color: 'pink', id: 'ghost2' },
        { x: 10, y: 9, direction: 'right', color: 'cyan', id: 'ghost3' }
    ],
    score: 0,
    lives: GAME_CONFIG.INITIAL_LIVES,
    dotsCount: 0,
    powerUpCount: 0,
    gameRunning: false,
    gameLoop: null,
    ghostLoop: null,
    powerUpActive: false,
    powerUpTimer: null
};

// Maze layout (1 = wall, 0 = dot, 2 = empty path, 3 = power-up)
const mazeLayout = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
    [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
    [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
    [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
    [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,3,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Initialize game
function initGame() {
    createBoard();
    updateDisplay();
    setupEventListeners();
}

// Create the game board
function createBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameState.board = [];
    gameState.dotsCount = 0;

    for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
        gameState.board[y] = [];
        for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`;
            
            const cellType = mazeLayout[y][x];
            gameState.board[y][x] = cellType;
            
            if (cellType === 1) {
                cell.classList.add('wall');
            } else if (cellType === 0) {
                cell.classList.add('dot');
                gameState.dotsCount++;
            } else if (cellType === 3) {
                cell.classList.add('power-up');
                gameState.powerUpCount++;
            } else {
                cell.classList.add('path');
            }
            
            gameBoard.appendChild(cell);
        }
    }
    
    // Place Pac-Man
    updatePacmanPosition();
    
    // Place Ghosts
    updateGhostPositions();
}

// Update Pac-Man position on board
function updatePacmanPosition() {
    // Remove previous Pac-Man
    document.querySelectorAll('.pacman').forEach(cell => {
        cell.classList.remove('pacman', 'right', 'left', 'up', 'down', 'chomping');
    });
    
    // Add Pac-Man to new position
    const pacmanCell = document.getElementById(`cell-${gameState.pacman.x}-${gameState.pacman.y}`);
    if (pacmanCell) {
        pacmanCell.classList.add('pacman', gameState.pacman.direction, 'chomping');
    }
}

// Update Ghost positions on board
function updateGhostPositions() {
    // Remove previous ghosts
    document.querySelectorAll('.ghost').forEach(cell => {
        cell.classList.remove('ghost', 'ghost-red', 'ghost-pink', 'ghost-cyan');
    });
    
    // Add ghosts to new positions
    gameState.ghosts.forEach(ghost => {
        const ghostCell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
        if (ghostCell) {
            ghostCell.classList.add('ghost', `ghost-${ghost.color}`);
        }
    });
}

// Check if position is valid (not a wall)
function isValidPosition(x, y) {
    if (x < 0 || x >= GAME_CONFIG.BOARD_WIDTH || y < 0 || y >= GAME_CONFIG.BOARD_HEIGHT) {
        return false;
    }
    return gameState.board[y][x] !== 1;
}

// Move Pac-Man
function movePacman(direction) {
    if (!gameState.gameRunning) return;
    
    let newX = gameState.pacman.x;
    let newY = gameState.pacman.y;
    
    switch (direction) {
        case 'up':
            newY--;
            break;
        case 'down':
            newY++;
            break;
        case 'left':
            newX--;
            break;
        case 'right':
            newX++;
            break;
    }
    
    // Handle tunnel effect (wrap around)
    if (newX < 0) newX = GAME_CONFIG.BOARD_WIDTH - 1;
    if (newX >= GAME_CONFIG.BOARD_WIDTH) newX = 0;
    
    if (isValidPosition(newX, newY)) {
        gameState.pacman.x = newX;
        gameState.pacman.y = newY;
        gameState.pacman.direction = direction;
        
        // Check if Pac-Man ate a dot
        if (gameState.board[newY][newX] === 0) {
            gameState.board[newY][newX] = 2; // Mark as eaten
            gameState.score += 10;
            gameState.dotsCount--;
            
            // Remove dot from display
            const cell = document.getElementById(`cell-${newX}-${newY}`);
            cell.classList.remove('dot');
            cell.classList.add('path');
            
            // Check win condition
            if (gameState.dotsCount === 0) {
                winGame();
                return;
            }
        }
        
        // Check if Pac-Man collected a power-up
        if (gameState.board[newY][newX] === 3) {
            gameState.board[newY][newX] = 2; // Mark as eaten
            gameState.score += 50;
            gameState.powerUpCount--;
            
            // Remove power-up from display
            const cell = document.getElementById(`cell-${newX}-${newY}`);
            cell.classList.remove('power-up');
            cell.classList.add('path');
            
            // Activate power-up effect
            activatePowerUp();
        }
        
        updatePacmanPosition();
        updateDisplay();
        
        // Check collision with ghosts
        checkCollisions();
    }
}

// Activate power-up effect
function activatePowerUp() {
    gameState.powerUpActive = true;
    
    // Clear existing timer if any
    if (gameState.powerUpTimer) {
        clearTimeout(gameState.powerUpTimer);
    }
    
    // Make ghosts vulnerable (change their appearance)
    document.querySelectorAll('.ghost').forEach(ghostCell => {
        ghostCell.style.filter = 'hue-rotate(180deg) brightness(0.7)';
    });
    
    // Add visual effect to Pac-Man
    const pacmanCell = document.getElementById(`cell-${gameState.pacman.x}-${gameState.pacman.y}`);
    if (pacmanCell) {
        pacmanCell.style.filter = 'brightness(1.5) drop-shadow(0 0 10px #ffff85)';
    }
    
    // Power-up lasts for 8 seconds
    gameState.powerUpTimer = setTimeout(() => {
        deactivatePowerUp();
    }, 8000);
    
    // Show power-up status
    showPowerUpStatus(true);
}

// Deactivate power-up effect
function deactivatePowerUp() {
    gameState.powerUpActive = false;
    
    // Reset ghost appearance
    document.querySelectorAll('.ghost').forEach(ghostCell => {
        ghostCell.style.filter = '';
    });
    
    // Reset Pac-Man appearance
    const pacmanCell = document.getElementById(`cell-${gameState.pacman.x}-${gameState.pacman.y}`);
    if (pacmanCell) {
        pacmanCell.style.filter = '';
    }
    
    // Hide power-up status
    showPowerUpStatus(false);
}

// Show/hide power-up status
function showPowerUpStatus(active) {
    const gameInfo = document.querySelector('.game-info');
    let statusElement = document.getElementById('power-up-status');
    
    if (active) {
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'power-up-status';
            statusElement.className = 'power-up-status';
            statusElement.innerHTML = '⭐ POWER UP ACTIVE!';
            gameInfo.appendChild(statusElement);
        }
    } else {
        if (statusElement) {
            statusElement.remove();
        }
    }
}

// Move Ghosts (AI)
function moveGhosts() {
    if (!gameState.gameRunning) return;
    
    gameState.ghosts.forEach((ghost, index) => {
        const possibleMoves = [];
        const directions = ['up', 'down', 'left', 'right'];
        
        for (const direction of directions) {
            let newX = ghost.x;
            let newY = ghost.y;
            
            switch (direction) {
                case 'up':
                    newY--;
                    break;
                case 'down':
                    newY++;
                    break;
                case 'left':
                    newX--;
                    break;
                case 'right':
                    newX++;
                    break;
            }
            
            // Handle tunnel effect
            if (newX < 0) newX = GAME_CONFIG.BOARD_WIDTH - 1;
            if (newX >= GAME_CONFIG.BOARD_WIDTH) newX = 0;
            
            if (isValidPosition(newX, newY)) {
                // Calculate distance to Pac-Man
                const distance = Math.abs(newX - gameState.pacman.x) + Math.abs(newY - gameState.pacman.y);
                possibleMoves.push({ x: newX, y: newY, direction, distance });
            }
        }
        
        if (possibleMoves.length > 0) {
            // Different AI behavior for each ghost
            let chosenMove;
            
            if (index === 0) {
                // Red ghost: Most aggressive, always tries to get closer
                possibleMoves.sort((a, b) => a.distance - b.distance);
                chosenMove = Math.random() < 0.8 ? possibleMoves[0] : possibleMoves[Math.floor(Math.random() * Math.min(2, possibleMoves.length))];
            } else if (index === 1) {
                // Pink ghost: Tries to ambush, sometimes moves randomly
                possibleMoves.sort((a, b) => a.distance - b.distance);
                chosenMove = Math.random() < 0.6 ? possibleMoves[0] : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            } else {
                // Cyan ghost: More random behavior, sometimes flees
                if (Math.random() < 0.3) {
                    // Sometimes try to get away from Pac-Man
                    possibleMoves.sort((a, b) => b.distance - a.distance);
                    chosenMove = possibleMoves[0];
                } else {
                    possibleMoves.sort((a, b) => a.distance - b.distance);
                    chosenMove = Math.random() < 0.5 ? possibleMoves[0] : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
            }
            
            ghost.x = chosenMove.x;
            ghost.y = chosenMove.y;
            ghost.direction = chosenMove.direction;
        }
    });
    
    updateGhostPositions();
    checkCollisions();
}

// Check collisions between Pac-Man and Ghosts
function checkCollisions() {
    for (const ghost of gameState.ghosts) {
        if (gameState.pacman.x === ghost.x && gameState.pacman.y === ghost.y) {
            if (gameState.powerUpActive) {
                // Pac-Man can eat ghosts when power-up is active
                gameState.score += 200;
                
                // Respawn ghost at center
                ghost.x = 9;
                ghost.y = 9;
                ghost.direction = 'up';
                
                updateDisplay();
                updateGhostPositions();
                return;
            } else {
                // Normal collision - lose life
                gameState.lives--;
                updateDisplay();
                
                if (gameState.lives <= 0) {
                    gameOver();
                    return;
                } else {
                    // Reset positions
                    gameState.pacman.x = 9;
                    gameState.pacman.y = 15;
                    gameState.ghosts[0] = { x: 9, y: 9, direction: 'up', color: 'red', id: 'ghost1' };
                    gameState.ghosts[1] = { x: 8, y: 9, direction: 'left', color: 'pink', id: 'ghost2' };
                    gameState.ghosts[2] = { x: 10, y: 9, direction: 'right', color: 'cyan', id: 'ghost3' };
                    updatePacmanPosition();
                    updateGhostPositions();
                    
                    // Deactivate power-up if active
                    if (gameState.powerUpActive) {
                        deactivatePowerUp();
                    }
                    
                    // Brief pause before continuing
                    gameState.gameRunning = false;
                    setTimeout(() => {
                        gameState.gameRunning = true;
                    }, 1000);
                    return;
                }
            }
        }
    }
}

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
}

// Start game
function startGame() {
    resetGameState();
    gameState.gameRunning = true;
    
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'inline-block';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-win').style.display = 'none';
    
    createBoard();
    
    // Start ghost movement
    gameState.ghostLoop = setInterval(moveGhosts, GAME_CONFIG.GHOST_SPEED);
}

// Restart game
function restartGame() {
    stopGame();
    startGame();
}

// Stop game
function stopGame() {
    gameState.gameRunning = false;
    if (gameState.ghostLoop) {
        clearInterval(gameState.ghostLoop);
        gameState.ghostLoop = null;
    }
    if (gameState.powerUpTimer) {
        clearTimeout(gameState.powerUpTimer);
        gameState.powerUpTimer = null;
    }
    // Reset any active power-up effects
    if (gameState.powerUpActive) {
        deactivatePowerUp();
    }
}

// Game over
function gameOver() {
    stopGame();
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('restart-btn').style.display = 'none';
}

// Win game
function winGame() {
    stopGame();
    document.getElementById('win-score').textContent = gameState.score;
    document.getElementById('game-win').style.display = 'block';
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('restart-btn').style.display = 'none';
}

// Reset game state
function resetGameState() {
    gameState = {
        board: [],
        pacman: { x: 9, y: 15, direction: 'right' },
        ghosts: [
            { x: 9, y: 9, direction: 'up', color: 'red', id: 'ghost1' },
            { x: 8, y: 9, direction: 'left', color: 'pink', id: 'ghost2' },
            { x: 10, y: 9, direction: 'right', color: 'cyan', id: 'ghost3' }
        ],
        score: 0,
        lives: GAME_CONFIG.INITIAL_LIVES,
        dotsCount: 0,
        powerUpCount: 0,
        gameRunning: false,
        gameLoop: null,
        ghostLoop: null,
        powerUpActive: false,
        powerUpTimer: null
    };
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener('keydown', (event) => {
        if (!gameState.gameRunning) return;
        
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                event.preventDefault();
                movePacman('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                event.preventDefault();
                movePacman('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                event.preventDefault();
                movePacman('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                event.preventDefault();
                movePacman('right');
                break;
        }
    });
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);
