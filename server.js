const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const gameData = require('./gameData');

const app = express();
const PORT = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, 'scores.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AREEB';

if (!process.env.ADMIN_PASSWORD) {
    console.warn("WARNING: ADMIN_PASSWORD environment variable is not set. Defaulting to 'AREEB'.");
}

// Sessions & Tokens store
const activeAdminSessions = new Set();
const SECRET_KEY = process.env.SECRET_KEY || 'rpg-event-samrudh-sharma-2026-secret';

function generateSessionToken(scenarioIndex) {
    const startTime = Date.now();
    const payload = `${startTime}_${scenarioIndex}`;
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    return `${payload}.${signature}`;
}

function verifySessionToken(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    if (signature !== expectedSignature) return null;
    const [startTimeStr, scenarioIndexStr] = payload.split('_');
    return {
        startTime: parseInt(startTimeStr, 10),
        scenarioIndex: parseInt(scenarioIndexStr, 10)
    };
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/win93', express.static(path.join(__dirname, 'win93')));

// List of allowed public files
const ALLOWED_STATIC_FILES = [
    'index.html',
    'app.js',
    'styles.css',
    'favicon.png',
    'background.png',
    'buddy.png',
    'buddy_puppy.png',
    'football_poster.jpg',
    'collar_lore.png',
    'dvd_lore.png',
    'family_drawing.png',
    'family_photo.jpg',
    'kanye.png',
    'sam.png',
    'sam_15.png',
    'vettel.png',
    'william.png',
    'action_figure_lore.png',
    'birthday_5.png',
    'herobrine.png',
    'crossword.js',
    'crossword.css',
    'buddy_crayon.png',
    'house_crayon.png',
    'sun_moon_crayon.png',
    'first_friends.png'
];

// Secure Static Middleware (restricts access to server.js, package.json, scores.json, etc.)
app.use((req, res, next) => {
    // Clean path and get filename
    const safePath = path.normalize(req.path).replace(/^(\.\.[\/\\])+/, '');
    const basename = path.basename(safePath);
    
    // Serve index.html for root path
    if (req.path === '/' || req.path === '/index.html') {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    
    // Serve allowed files from assets folder
    if (req.path.startsWith('/assets/')) {
        const assetName = path.basename(req.path);
        const allowedAssets = ['aged_newspaper.svg', 'coffee_stain.svg', 'vintage_photo.svg', 'wood_desk.svg'];
        if (allowedAssets.includes(assetName)) {
            return res.sendFile(path.join(__dirname, 'assets', assetName));
        }
    }
    
    // Serve only allowed files
    if (ALLOWED_STATIC_FILES.includes(basename)) {
        return res.sendFile(path.join(__dirname, basename));
    }
    
    next();
});

// Admin Route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Initialize scores.json if it doesn't exist
if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
}

// Helper to read scores
function readScores() {
    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading scores:', err);
        return [];
    }
}

// Helper to write scores
function writeScores(scores) {
    try {
        fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
    } catch (err) {
        console.error('Error writing scores:', err);
    }
}

// Middleware to authenticate admin sessions via Bearer Token
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || !activeAdminSessions.has(token)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin session.' });
    }
    next();
}

// Backend Answer Keys & Placements (Hidden from Client)
const CORE_ITEMS_ORIGINS = {
    'misplaced-drawing': '5',
    'misplaced-gift': '5',
    'misplaced-block': '5',
    'misplaced-apology': '10',
    'misplaced-texts': '10',
    'misplaced-trip-form': '10',
    'misplaced-graduation-album': '15',
    'misplaced-visa-form': '15',
    'misplaced-chemistry-kit': '15'
};

const CORRECT_WORDS = [
    { word: "AMARILLO", x: 2, y: 3, dir: "H" },
    { word: "STINKYSAM", x: 1, y: 11, dir: "H" },
    { word: "HEROBRINE", x: 1, y: 13, dir: "H" },
    { word: "STANFORD", x: 0, y: 7, dir: "H" },
    { word: "SEBASTIANVETTEL", x: 2, y: 0, dir: "V" },
    { word: "SOCCER", x: 9, y: 2, dir: "V" },
    { word: "IELTS", x: 7, y: 1, dir: "V" },
    { word: "CORGI", x: 5, y: 1, dir: "V" }
];

const crosswordCells = {};
CORRECT_WORDS.forEach(w => {
    for (let i = 0; i < w.word.length; i++) {
        const curY = w.y + (w.dir === "V" ? i : 0);
        const curX = w.x + (w.dir === "H" ? i : 0);
        crosswordCells[`${curY}_${curX}`] = w.word[i].toUpperCase();
    }
});

const SPECIAL_SECRET_CELLS = [
    { r: 1, c: 2 },  
    { r: 5, c: 2 }, 
    { r: 9, c: 2 }, 
    { r: 7, c: 3 },  
    { r: 11, c: 8 }, 
    { r: 13, c: 5 }, 
    { r: 6, c: 9 },  
    { r: 1, c: 7 },  
    { r: 3, c: 7 }, 
    { r: 5, c: 5 }   
];

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

// API: Get Scores (Excludes tokens in public output)
app.get('/api/scores', (req, res) => {
    const scores = readScores();
    
    // Sort scores: Completed crossword teams first, ordered by total time (lowest first)
    // Then non-completed crossword teams, ordered by rooms score (highest first) and rooms time (lowest first)
    scores.sort((a, b) => {
        const aCrossCompleted = a.crossword && a.crossword.completed ? 1 : 0;
        const bCrossCompleted = b.crossword && b.crossword.completed ? 1 : 0;
        
        if (aCrossCompleted !== bCrossCompleted) {
            return bCrossCompleted - aCrossCompleted;
        }
        
        if (aCrossCompleted === 1) {
            return a.crossword.time - b.crossword.time || (b.rooms ? b.rooms.score : 0) - (a.rooms ? a.rooms.score : 0);
        } else {
            const aRoomsScore = a.rooms ? a.rooms.score : 0;
            const bRoomsScore = b.rooms ? b.rooms.score : 0;
            const aRoomsTime = a.rooms ? a.rooms.time : Infinity;
            const bRoomsTime = b.rooms ? b.rooms.time : Infinity;
            
            return bRoomsScore - aRoomsScore || aRoomsTime - bRoomsTime;
        }
    });

    const publicScores = scores.map(({ token, ...rest }) => rest);
    res.json(publicScores);
});

// API: Start Game Session (Generate game token for score submission anti-cheat)
app.post('/api/start-session', (req, res) => {
    const { team } = req.body;
    
    if (team) {
        const scores = readScores();
        if (scores.find(s => s.team.trim().toLowerCase() === team.trim().toLowerCase())) {
            return res.status(400).json({ error: 'Team name already exists! Please choose a different name.' });
        }
    }

    const scenarioIndex = Math.floor(Math.random() * gameData.scenarios.length);
    const token = generateSessionToken(scenarioIndex);
    res.json({ token, startingPlacements: gameData.scenarios[scenarioIndex] });
});

// API: Submit Rooms Findings (Secure Verification)
app.post('/api/submit-rooms', (req, res) => {
    const { team, items, token } = req.body;
    
    if (!team || !items || !Array.isArray(items) || !token) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Session Token Validation (Anti-Cheat)
    const session = verifySessionToken(token);
    if (!session) {
        return res.status(403).json({ error: 'Cheat protection active: Invalid or missing game session token.' });
    }
    const { startTime } = session;

    // Invalidate if token is older than 2 hours
    if (Date.now() - startTime > 2 * 60 * 60 * 1000) {
        return res.status(403).json({ error: 'Game session has expired.' });
    }

    const scores = readScores();
    
    // Check for duplicate team name
    if (scores.find(s => s.team.trim().toLowerCase() === team.trim().toLowerCase())) {
        return res.status(400).json({ error: 'Team name already exists! Please choose a different name.' });
    }

    // Check if token has already been used (single-use validation)
    if (scores.some(s => s.token === token)) {
        return res.status(403).json({ error: 'Cheat protection active: Game session token already used.' });
    }

    // 2. Server-side Placement Check & Score Calculation
    let correctCount = 0;
    const itemResults = [];
    const coreItemsKeys = Object.keys(CORE_ITEMS_ORIGINS);

    items.forEach(item => {
        const correctRoom = CORE_ITEMS_ORIGINS[item.id];
        if (correctRoom) {
            if (item.room === correctRoom) {
                correctCount++;
                itemResults.push({ name: item.name, status: 'correct', room: correctRoom });
            } else {
                itemResults.push({ name: item.name, status: 'incorrect', room: item.room });
            }
        }
    });

    const score = Math.round((correctCount / coreItemsKeys.length) * 100);
    const roomsTime = Date.now() - startTime;

    scores.push({
        team,
        token,
        date: new Date().toISOString(),
        rooms: {
            score,
            time: roomsTime,
            formatted: formatTime(roomsTime),
            items: itemResults
        },
        crossword: null
    });
    
    writeScores(scores);
    res.json({ success: true, score, formatted: formatTime(roomsTime) });
});

// API: Submit Crossword Reconstruction (Secure Verification)
app.post('/api/submit-crossword', (req, res) => {
    const { token, answers } = req.body;

    if (!token || !answers) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Session Token Validation (Anti-Cheat)
    const session = verifySessionToken(token);
    if (!session) {
        return res.status(403).json({ error: 'Cheat protection active: Invalid or missing game session token.' });
    }
    const { startTime } = session;

    const scores = readScores();
    const teamRecord = scores.find(s => s.token === token);
    
    if (!teamRecord) {
        return res.status(404).json({ error: 'Team session record not found. Please lock in room placements first.' });
    }

    if (teamRecord.crossword && teamRecord.crossword.completed) {
        return res.status(400).json({ error: 'Memory reconstruction already submitted.' });
    }

    // 2. Server-side Letter Cell Validation
    const failedCells = [];
    let isAllCorrect = true;

    for (let key in crosswordCells) {
        const correctChar = crosswordCells[key];
        const userChar = (answers[key] || '').trim().toUpperCase();
        if (userChar !== correctChar) {
            isAllCorrect = false;
            failedCells.push(key);
        }
    }

    if (!isAllCorrect) {
        return res.json({ success: false, failedCells });
    }

    // 3. Mark Completed & Record Total Time
    const totalTime = Date.now() - startTime;
    teamRecord.crossword = {
        completed: true,
        time: totalTime,
        formatted: formatTime(totalTime)
    };

    writeScores(scores);
    res.json({ success: true, secretCells: SPECIAL_SECRET_CELLS, formatted: formatTime(totalTime) });
});

// API: Verify Admin Password (Returns Admin Session Bearer Token)
app.post('/api/verify-admin', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(16).toString('hex');
        activeAdminSessions.add(token);
        return res.json({ success: true, token });
    } else {
        return res.status(403).json({ error: 'Invalid password' });
    }
});

// API: Get Crossword Metadata (Exposes positions and clues only, no word answers)
app.get('/api/crossword-metadata', (req, res) => {
    res.json(gameData.WORDS_METADATA);
});

// API: Get Lore Detail dynamically
app.get('/api/lore/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const html = gameData.LORE_DATA[itemId] || '<h3>Unknown Item</h3><p>Could not expand item data.</p>';
    
    const responseData = { html };
    if (itemId === 'bookshelf-cupboard') {
        responseData.yearbookStudents = gameData.yearbookStudents;
        responseData.books = gameData.CUPBOARD_BOOKS;
    } else if (itemId === 'schoolbag') {
        responseData.items = gameData.SCHOOLBAG_ITEMS;
    } else if (itemId === 'posters-collection') {
        responseData.items = gameData.POSTER_ITEMS;
    } else if (itemId === 'picture-book') {
        responseData.pages = gameData.pictureBookPages;
    } else if (itemId === 'crt-tv-selection') {
        responseData.dvds = gameData.dvdVideos;
    } else if (itemId === 'cassette-tape') {
        responseData.subtitles = gameData.cassetteSubtitles;
    }
    
    res.json(responseData);
});

// API: Verify Computer Recovery Password
app.post('/api/verify-computer-password', (req, res) => {
    const { password, token } = req.body;
    
    // First verify password
    if (!password || password.trim().toLowerCase() !== gameData.COMPUTER_PASSWORD) {
        return res.json({ success: false, error: 'INVALID PASSWORD' });
    }

    // Next check token and crossword status
    if (!token) {
        return res.json({ success: false, error: 'CROSSWORD NOT COMPLETED' });
    }

    const session = verifySessionToken(token);
    if (!session) {
        return res.json({ success: false, error: 'INVALID SESSION' });
    }

    const scores = readScores();
    const teamRecord = scores.find(s => s.token === token);
    
    if (!teamRecord || !teamRecord.crossword || !teamRecord.crossword.completed) {
        return res.json({ success: false, error: 'CROSSWORD NOT COMPLETED' });
    }

    teamRecord.computerUnlocked = true;
    writeScores(scores);

    res.json({ success: true });
});

// API: Get Computer File Contents (Securely fetches decrypted VFS files)
app.post('/api/computer-file/:fileKey', (req, res) => {
    const { token } = req.body;
    const fileKey = req.params.fileKey;

    if (!token || !fileKey) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = verifySessionToken(token);
    if (!session) {
        return res.status(403).json({ error: 'Invalid or missing session token.' });
    }

    const scores = readScores();
    const teamRecord = scores.find(s => s.token === token);
    
    if (!teamRecord) {
        return res.status(404).json({ error: 'Team session record not found.' });
    }

    // Verify computer has been unlocked
    if (!teamRecord.computerUnlocked) {
        return res.status(403).json({ error: 'ACCESS DENIED: Computer is locked.' });
    }

    // Return the secure file content
    const html = gameData.COMPUTER_FILES[fileKey];
    if (!html) {
        return res.status(404).json({ error: 'File not found.' });
    }

    res.json({ html });
});

// API: Submit Google Form Final Time
app.post('/api/submit-final-time', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Missing required session token' });
    }

    const session = verifySessionToken(token);
    if (!session) {
        return res.status(403).json({ error: 'Invalid or missing session token.' });
    }

    const { startTime } = session;
    const scores = readScores();
    const teamRecord = scores.find(s => s.token === token);

    if (!teamRecord) {
        return res.status(404).json({ error: 'Team record not found.' });
    }

    // Verify they have completed crossword first
    if (!teamRecord.crossword || !teamRecord.crossword.completed) {
        return res.status(400).json({ error: 'Crossword must be completed before submitting final time.' });
    }

    if (teamRecord.final && teamRecord.final.completed) {
        return res.json({ success: true, formatted: teamRecord.final.formatted });
    }

    const totalTime = Date.now() - startTime;
    teamRecord.final = {
        completed: true,
        time: totalTime,
        formatted: formatTime(totalTime)
    };

    writeScores(scores);
    res.json({ success: true, formatted: formatTime(totalTime) });
});

// API: Clear Scores (Requires Session Token)
app.post('/api/clear-scores', authenticateAdmin, (req, res) => {
    writeScores([]);
    res.json({ message: 'Leaderboard cleared successfully' });
});

// API: Delete Specific Score (Requires Session Token)
app.post('/api/delete-score', authenticateAdmin, (req, res) => {
    const { team } = req.body;
    let scores = readScores();
    scores = scores.filter(s => s.team !== team);
    writeScores(scores);
    res.json({ message: 'Team deleted successfully' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`RPG Event Server running on http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});
