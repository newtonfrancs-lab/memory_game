/**
 * ⚡ NEURAL_DECRYPTOR CORE v3.0
 * Theme: Cyber-Hacker / Netrunner
 * Logic: Optimized Fisher-Yates + State Locking
 */

const CONFIG = {
    // Digital Nodes for Decryption
    icons: ['💾', '📡', '🛡️', '🔑', '📟', '🔌', '💻', '🔋'],
    scoring: {
        base: 15000,
        movePenalty: 150,
        timePenalty: 30,
        min: 500
    },
    delays: {
        flipBack: 1000,
        resultProcessing: 500
    }
};

let gameState = {
    flipped: [],
    matchedPairs: 0,
    moves: 0,
    seconds: 0,
    timerId: null,
    isLocked: false
};

/**
 * 🔹 Kernel Initialization
 */
const initBattle = () => {
    const board = document.getElementById('game-board');
    if (!board) return;

    // Reset State & UI
    board.innerHTML = '';
    resetGameState();

    // Generate & Shuffle Subroutine
    const deck = [...CONFIG.icons, ...CONFIG.icons];
    shuffleDeck(deck);

    // Build Neural Grid
    deck.forEach((icon, i) => {
        const node = createNode(icon, i);
        board.appendChild(node);
    });

    startUplinkTimer();
};

/**
 * 🔹 DAA: Fisher-Yates Shuffle O(n)
 */
const shuffleDeck = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

const createNode = (icon, id) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">LINKING...</div>
            <div class="card-back">${icon}</div>
        </div>
    `;

    card.addEventListener('click', () => handleNodeAccess(card));
    return card;
};

/**
 * 🔹 Access Logic
 */
const handleNodeAccess = (node) => {
    if (gameState.isLocked || node.classList.contains('flipped') || node.classList.contains('matched')) return;

    node.classList.add('flipped');
    gameState.flipped.push(node);

    if (gameState.flipped.length === 2) {
        gameState.moves++;
        updateTerminalHUD();
        verifyNeuralSync();
    }
};

const verifyNeuralSync = () => {
    gameState.isLocked = true;
    const [node1, node2] = gameState.flipped;
    
    // Compare inner text of the .card-back
    const val1 = node1.querySelector('.card-back').innerText;
    const val2 = node2.querySelector('.card-back').innerText;

    if (val1 === val2) {
        syncSuccess(node1, node2);
    } else {
        syncFailure(node1, node2);
    }
};

const syncSuccess = (n1, n2) => {
    n1.classList.add('matched');
    n2.classList.add('matched');
    gameState.matchedPairs++;
    gameState.flipped = [];
    gameState.isLocked = false;

    if (gameState.matchedPairs === CONFIG.icons.length) terminateSession();
};

const syncFailure = (n1, n2) => {
    setTimeout(() => {
        n1.classList.remove('flipped');
        n2.classList.remove('flipped');
        gameState.flipped = [];
        gameState.isLocked = false;
    }, CONFIG.delays.flipBack);
};

/**
 * 🔹 UI & Registry Subroutines
 */
const updateTerminalHUD = () => {
    const moveEl = document.getElementById('moves');
    if (moveEl) moveEl.innerText = gameState.moves.toString().padStart(2, '0');
};

const terminateSession = () => {
    clearInterval(gameState.timerId);
    
    const finalScore = Math.max(
        CONFIG.scoring.base - (gameState.moves * CONFIG.scoring.movePenalty) - (gameState.seconds * CONFIG.scoring.timePenalty),
        CONFIG.scoring.min
    );

    setTimeout(() => {
        const netrunnerID = prompt("UPLINK_STABLE. Enter Netrunner ID:") || "GHOST_USER";
        uploadStats(netrunnerID, finalScore);
    }, CONFIG.delays.resultProcessing);
};

const uploadStats = (id, score) => {
    const registry = JSON.parse(localStorage.getItem('memoryData')) || [];
    registry.push({
        player: id,
        moves: gameState.moves,
        time: gameState.seconds,
        score: score,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('memoryData', JSON.stringify(registry));
    window.location.href = 'leaderboard.html';
};

const startUplinkTimer = () => {
    gameState.seconds = 0;
    gameState.timerId = setInterval(() => {
        gameState.seconds++;
        const m = Math.floor(gameState.seconds / 60).toString().padStart(2, '0');
        const s = (gameState.seconds % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('time');
        if (timerEl) timerEl.innerText = `${m}:${s}`;
    }, 1000);
};

const resetGameState = () => {
    if (gameState.timerId) clearInterval(gameState.timerId);
    gameState = {
        flipped: [], matchedPairs: 0,
        moves: 0, seconds: 0, isLocked: false,
        timerId: null
    };
};

// Initial system check
document.addEventListener('DOMContentLoaded', initBattle);