document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    const currentScoreElem = document.getElementById('current-score');
    const highScoreElem = document.getElementById('high-score');
    const finalScoreElem = document.getElementById('final-score');

    const GRID_SIZE = 20;
    const TILE_SIZE = canvas.width / GRID_SIZE;

    const FCP_COLORS = {
        PRIMARY_BLUE: '#0047AB',
        WHITE: '#FFFFFF',
        GOLD: '#F5D042'
    };

    let snake = [];
    let food = {};
    let score = 0;
    let highScore = 0;
    let direction = 'RIGHT';
    let nextDirection = 'RIGHT';
    let gameInterval;
    let gameStatus = 'INIT'; // INIT, RUNNING, GAME_OVER

    function init() {
        highScore = localStorage.getItem('fcp_snake_hs') || 0;
        highScoreElem.textContent = highScore;

        startButton.addEventListener('click', startGame);
        restartButton.addEventListener('click', startGame);
        document.addEventListener('keydown', handleKeyPress);
    }

    function resetGame() {
        snake = [
            { x: 10, y: 10 }, // Head
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        score = 0;
        direction = 'RIGHT';
        nextDirection = 'RIGHT';
        currentScoreElem.textContent = score;
        generateFood();
    }

    function startGame() {
        resetGame();
        gameStatus = 'RUNNING';
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 120); // Game speed
    }

    function gameLoop() {
        if (gameStatus !== 'RUNNING') return;
        update();
        draw();
    }

    function update() {
        direction = nextDirection;
        const head = { ...snake[0] };

        switch (direction) {
            case 'UP': head.y--; break;
            case 'DOWN': head.y++; break;
            case 'LEFT': head.x--; break;
            case 'RIGHT': head.x++; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            return gameOver();
        }

        // Self collision
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return gameOver();
            }
        }

        snake.unshift(head);

        // Food collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            currentScoreElem.textContent = score;
            generateFood();
        } else {
            snake.pop();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = FCP_COLORS.PRIMARY_BLUE;
            ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = FCP_COLORS.WHITE;
            ctx.strokeRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            // Draw eye on head
            if (index === 0) {
                ctx.fillStyle = FCP_COLORS.GOLD;
                ctx.fillRect(
                    segment.x * TILE_SIZE + TILE_SIZE / 2.5,
                    segment.y * TILE_SIZE + TILE_SIZE / 5,
                    TILE_SIZE / 5,
                    TILE_SIZE / 5
                );
            }
        });

        // Draw food
        ctx.fillStyle = FCP_COLORS.WHITE;
        ctx.beginPath();
        ctx.arc(
            food.x * TILE_SIZE + TILE_SIZE / 2,
            food.y * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE / 2.5,
            0, 2 * Math.PI
        );
        ctx.fill();
    }

    function generateFood() {
        let newFoodPosition;
        do {
            newFoodPosition = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
        } while (isFoodOnSnake(newFoodPosition));
        food = newFoodPosition;
    }

    function isFoodOnSnake(position) {
        return snake.some(segment => segment.x === position.x && segment.y === position.y);
    }

    function handleKeyPress(e) {
        if (gameStatus !== 'RUNNING') return;

        e.preventDefault(); // Prevent page scroll

        const key = e.key;
        if (key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
        if (key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
        if (key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
        if (key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
    }

    function gameOver() {
        gameStatus = 'GAME_OVER';
        clearInterval(gameInterval);

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('fcp_snake_hs', highScore);
            highScoreElem.textContent = highScore;
        }

        finalScoreElem.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    init();
});