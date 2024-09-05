// 遊戲常數
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const SHIP_SIZE = 30;
const PLANET_SIZE = 80;
const PARTICLE_COUNT = 20;
let GRAVITY = 0.05;
let BOOST_SPEED = 0.5;
let TURN_SPEED = 0.1;
const ASTEROID_SIZE = 20;
const ASTEROID_COUNT = 10;
const SCORE_THRESHOLD = 4000;

// 遊戲變數
let ship;
let planets = [];
let asteroids = [];
let particles = [];
let score = 0;
let gameLoop;
let isGameOver = false;
let isScoreStarted = false;

// 初始化遊戲
function init() {
    // 獲取畫布和繪圖上下文
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    // 創建飛船
    ship = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        vx: 0,
        vy: 0,
        radius: SHIP_SIZE / 2,
        angle: 0,
        rotation: 0
    };

    // 創建行星
    createPlanets();

    // 創建小行星
    createAsteroids();

    // 設置事件監聽器
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('gravity').addEventListener('input', updateSettings);
    document.getElementById('boost-speed').addEventListener('input', updateSettings);
    document.getElementById('turn-speed').addEventListener('input', updateSettings);

    // 重置分數和開始計分標誌
    score = 0;
    isScoreStarted = false;

    // 開始遊戲循環
    gameLoop = setInterval(update, 1000 / 60);
}

// 更新設定
function updateSettings() {
    GRAVITY = parseFloat(document.getElementById('gravity').value);
    BOOST_SPEED = parseFloat(document.getElementById('boost-speed').value);
    TURN_SPEED = parseFloat(document.getElementById('turn-speed').value);
}

// 更新遊戲狀態
function update() {
    if (!isGameOver) {
        // 更新飛船位置和速度
        updateShip();

        // 檢查飛船與行星碰撞
        checkCollisions();

        // 檢查飛船與小行星碰撞
        checkAsteroidCollisions();

        // 更新粒子
        updateParticles();

        // 更新小行星
        updateAsteroids();

        // 繪製遊戲場景
        render();

        // 如果開始計分,更新分數
        if (isScoreStarted) {
            score++;
            document.getElementById('score').textContent = score;
        }
    }
}

// 更新飛船位置和速度
function updateShip() {
    // 應用引力
    for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        const dx = planet.x - ship.x;
        const dy = planet.y - ship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = GRAVITY * planet.mass / (distance * distance);
        const angle = Math.atan2(dy, dx);
        ship.vx += force * Math.cos(angle);
        ship.vy += force * Math.sin(angle);
    }

    // 限制飛船速度
    const maxSpeed = 5;
    const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
    if (speed > maxSpeed) {
        ship.vx = (ship.vx / speed) * maxSpeed;
        ship.vy = (ship.vy / speed) * maxSpeed;
    }

    // 應用旋轉
    ship.angle += ship.rotation;

    // 更新位置
    ship.x += ship.vx;
    ship.y += ship.vy;

    // 邊界檢查
    if (ship.x < 0) ship.x = GAME_WIDTH;
    else if (ship.x > GAME_WIDTH) ship.x = 0;
    if (ship.y < 0) ship.y = GAME_HEIGHT;
    else if (ship.y > GAME_HEIGHT) ship.y = 0;
}

// 檢查飛船與行星碰撞
function checkCollisions() {
    for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        const dx = planet.x - ship.x;
        const dy = planet.y - ship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < ship.radius + planet.radius) {
            // 遊戲結束
            isGameOver = true;
            endGame();
            return;
        }
    }
}

// 檢查飛船與小行星碰撞
function checkAsteroidCollisions() {
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        const dx = asteroid.x - ship.x;
        const dy = asteroid.y - ship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < ship.radius + asteroid.radius) {
            // 遊戲結束
            isGameOver = true;
            endGame();
            return;
        }
    }
}

// 繪製遊戲場景
function render() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // 清空畫布
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 繪製行星
    for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        // 繪製行星光暈
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = planet.glowColor;
        ctx.fill();
        ctx.closePath();
        // 繪製行星
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.fill();
        ctx.closePath();
    }

    // 繪製小行星
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#888';
        ctx.fill();
        ctx.closePath();
    }

    // 繪製飛船
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, -10);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();

    // 繪製粒子
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.closePath();
    }

    // 更新分數
    if (isScoreStarted) {
        document.getElementById('score').textContent = score;
    }
}

// 創建行星
function createPlanets() {
    planets = [];
    const numPlanets = Math.floor(Math.random() * 3) + 2; // 隨機生成 2-4 個行星
    const planetPositions = [];

    // 將畫布分割成網格
    const gridSize = Math.min(GAME_WIDTH, GAME_HEIGHT) / 4;
    for (let i = gridSize / 2; i < GAME_WIDTH; i += gridSize) {
        for (let j = gridSize / 2; j < GAME_HEIGHT; j += gridSize) {
            planetPositions.push({ x: i, y: j });
        }
    }

    // 隨機選擇行星位置
    for (let i = 0; i < numPlanets; i++) {
        if (planetPositions.length === 0) {
            break;
        }
        const index = Math.floor(Math.random() * planetPositions.length);
        const { x, y } = planetPositions[index];
        planetPositions.splice(index, 1);

        const planet = {
            x: x,
            y: y,
            radius: PLANET_SIZE / 2,
            mass: 1500,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`,
            glowColor: `hsla(${Math.random() * 360}, 100%, 80%, 0.7)`
        };
        planets.push(planet);
    }
}

// 創建小行星
function createAsteroids() {
    asteroids = [];
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        const x = Math.random() * GAME_WIDTH;
        const y = Math.random() * GAME_HEIGHT;
        const asteroid = {
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            radius: ASTEROID_SIZE / 2
        };
        asteroids.push(asteroid);
    }
}

// 處理鍵盤按下事件
function handleKeyDown(event) {
    switch (event.keyCode) {
        case 37: // 左箭頭
            ship.rotation = -TURN_SPEED;
            break;
        case 39: // 右箭頭
            ship.rotation = TURN_SPEED;
            break;
        case 32: // 空白鍵
            event.preventDefault(); // 防止空白鍵導致頁面滾動
            boostShip();
            break;
    }
}

// 處理鍵盤釋放事件
function handleKeyUp(event) {
    switch (event.keyCode) {
        case 37: // 左箭頭
        case 39: // 右箭頭
            ship.rotation = 0;
            break;
    }
}

// 飛船加速
function boostShip() {
    ship.vx += BOOST_SPEED * Math.cos(ship.angle);
    ship.vy += BOOST_SPEED * Math.sin(ship.angle);
    createParticles();

    // 開始計分
    if (!isScoreStarted) {
        isScoreStarted = true;
    }
}

// 創建粒子
function createParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = ship.angle + Math.PI + (Math.random() - 0.5) * Math.PI / 4;
        const particle = {
            x: ship.x - ship.radius * Math.cos(angle),
            y: ship.y - ship.radius * Math.sin(angle),
            radius: Math.random() * 3 + 1,
            color: `rgba(255, 255, 255, ${Math.random()})`,
            speed: Math.random() * 5 + 5,
            angle: angle
        };
        particles.push(particle);
    }
}

// 更新粒子
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.speed * Math.cos(particle.angle);
        particle.y += particle.speed * Math.sin(particle.angle);
        particle.radius -= 0.1;
        if (particle.radius < 0) {
            particles.splice(i, 1);
        }
    }
}

// 更新小行星
function updateAsteroids() {
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];

        // 如果分數超過閾值,應用引力
        if (score >= SCORE_THRESHOLD) {
            for (let j = 0; j < planets.length; j++) {
                const planet = planets[j];
                const dx = planet.x - asteroid.x;
                const dy = planet.y - asteroid.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = GRAVITY * planet.mass / (distance * distance);
                const angle = Math.atan2(dy, dx);
                asteroid.vx += force * Math.cos(angle);
                asteroid.vy += force * Math.sin(angle);
            }
        }

        // 更新位置
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;

        // 檢查小行星與行星碰撞
        for (let j = 0; j < planets.length; j++) {
            const planet = planets[j];
            const dx = planet.x - asteroid.x;
            const dy = planet.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < asteroid.radius + planet.radius) {
                // 移除小行星
                asteroids.splice(i, 1);
                i--;
                break;
            }
        }
    }
}

// 遊戲結束
function endGame() {
    clearInterval(gameLoop);
    showModal(`遊戲結束！你的分數是 ${score}`);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.getElementById('gravity').removeEventListener('input', updateSettings);
    document.getElementById('boost-speed').removeEventListener('input', updateSettings);
    document.getElementById('turn-speed').removeEventListener('input', updateSettings);
}

// 顯示模態框
function showModal(message) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${message}</h2>
            <button id="restart-button">重新開始</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('restart-button').addEventListener('click', resetGame);
}

// 重置遊戲
function resetGame() {
    score = 0;
    ship.x = GAME_WIDTH / 2;
    ship.y = GAME_HEIGHT / 2;
    ship.vx = 0;
    ship.vy = 0;
    ship.angle = 0;
    ship.rotation = 0;
    particles = [];
    asteroids = [];
    isGameOver = false;
    isScoreStarted = false;
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    createPlanets();
    createAsteroids();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('gravity').addEventListener('input', updateSettings);
    document.getElementById('boost-speed').addEventListener('input', updateSettings);
    document.getElementById('turn-speed').addEventListener('input', updateSettings);
    gameLoop = setInterval(update, 1000 / 60);
}

// 開始遊戲
document.getElementById('start-button').addEventListener('click', function() {
    document.getElementById('game-ui').style.display = 'none';
    init();
});