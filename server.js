const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, 'scores.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');

if (!process.env.ADMIN_PASSWORD) {
    console.warn("WARNING: ADMIN_PASSWORD environment variable is not set.");
    console.warn(`A temporary admin password has been generated for this session: ${ADMIN_PASSWORD}`);
}

// Sessions & Tokens in-memory store
const activeAdminSessions = new Set();
const activeGameSessions = new Map(); // token -> timestamp

// Middleware
app.use(cors());
app.use(express.json());

// List of allowed public files
const ALLOWED_STATIC_FILES = [
    'index.html',
    'app.js',
    'styles.css',
    'favicon.png',
    'background.png',
    'buddy.png',
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
    'herobrine.png'
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

// API: Get Scores
app.get('/api/scores', (req, res) => {
    const scores = readScores();
    // Sort scores: highest score first, then lowest time
    scores.sort((a, b) => b.score - a.score || a.time - b.time);
    res.json(scores);
});

// API: Start Game Session (Generate game token for score submission anti-cheat)
app.post('/api/start-session', (req, res) => {
    const token = crypto.randomBytes(16).toString('hex');
    activeGameSessions.set(token, Date.now());
    res.json({ token });
});

// API: Submit a Score (Requires Valid Game Session Token & Server-side validation)
app.post('/api/submit-score', (req, res) => {
    const { team, score, time, formatted, items, token } = req.body;
    
    if (!team || score === undefined || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Session Token Validation (Anti-Cheat)
    if (!token || !activeGameSessions.has(token)) {
        return res.status(403).json({ error: 'Cheat protection active: Invalid or missing game session token.' });
    }

    const startTime = activeGameSessions.get(token);
    // Invalidate if token is older than 2 hours
    if (Date.now() - startTime > 2 * 60 * 60 * 1000) {
        activeGameSessions.delete(token);
        return res.status(403).json({ error: 'Game session has expired.' });
    }

    // Single-use token invalidation
    activeGameSessions.delete(token);

    // 2. Server-side Score Integrity Check
    if (items && Array.isArray(items)) {
        const correctCount = items.filter(item => item.status === 'correct').length;
        const expectedScore = Math.round((correctCount / 9) * 100);
        if (score !== expectedScore) {
            return res.status(400).json({ error: 'Cheat protection active: Score calculation mismatch.' });
        }
    }

    const scores = readScores();
    
    // Check for duplicate team name
    if (scores.find(s => s.team.trim().toLowerCase() === team.trim().toLowerCase())) {
        return res.status(400).json({ error: 'Team name already exists! Please choose a different name.' });
    }

    scores.push({ team, score, time, formatted, items: items || [], date: new Date().toISOString() });
    writeScores(scores);
    
    // Return the updated sorted leaderboard
    scores.sort((a, b) => b.score - a.score || a.time - b.time);
    res.json(scores);
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
