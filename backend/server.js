const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'super_secret_mood_tracker_key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database Setup
const db = new sqlite3.Database(path.join(__dirname, 'moodtracker.db'), (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log('Connected to sqlite database.');
        // Initialize tables
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS mood_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                mood TEXT,
                mood_score INTEGER,
                date TEXT,
                time TEXT,
                note TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS journals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                text TEXT,
                date TEXT,
                target_date TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`);

            // Legacy sync table for backward compatibility if needed
            db.run(`CREATE TABLE IF NOT EXISTS user_sync (
                user_id INTEGER PRIMARY KEY,
                moodHistory TEXT,
                moodJournals TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`);
        });
    }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], function (err) {
            if (err) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            res.status(201).json({ message: 'User created successfully', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
});

// --- MOOD ROUTES ---

// Log a mood
app.post('/api/moods', authenticateToken, (req, res) => {
    const { mood, mood_score, date, time, note } = req.body;

    db.run(
        'INSERT INTO mood_logs (user_id, mood, mood_score, date, time, note) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, mood, mood_score, date, time, note],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Mood logged successfully' });
        }
    );
});

// Get user's moods
app.get('/api/moods', authenticateToken, (req, res) => {
    db.all('SELECT * FROM mood_logs WHERE user_id = ? ORDER BY date DESC, time DESC', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- JOURNAL ROUTES ---

// Save a journal entry
app.post('/api/journals', authenticateToken, (req, res) => {
    const { text, date, target_date } = req.body;

    // Update if already exists for the same target_date, else insert
    db.get('SELECT id FROM journals WHERE user_id = ? AND target_date = ?', [req.user.id, target_date], (err, row) => {
        if (row) {
            db.run('UPDATE journals SET text = ?, date = ? WHERE id = ?', [text, date, row.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Journal updated successfully' });
            });
        } else {
            db.run('INSERT INTO journals (user_id, text, date, target_date) VALUES (?, ?, ?, ?)', [req.user.id, text, date, target_date], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ id: this.lastID, message: 'Journal saved successfully' });
            });
        }
    });
});

// Get user's journals
app.get('/api/moods', (req, res) => {
    db.all('SELECT * FROM journals WHERE user_id = ? ORDER BY target_date DESC', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- ANALYTICS ---
app.get('/api/analytics', authenticateToken, (req, res) => {
    const data = { trends: [], frequentMood: null };

    db.all('SELECT date, AVG(mood_score) as avg_score FROM mood_logs WHERE user_id = ? GROUP BY date ORDER BY date ASC LIMIT 30', [req.user.id], (err, trendRows) => {
        if (err) return res.status(500).json({ error: err.message });
        data.trends = trendRows;

        db.get('SELECT mood, COUNT(mood) as count FROM mood_logs WHERE user_id = ? GROUP BY mood ORDER BY count DESC LIMIT 1', [req.user.id], (err, freqRow) => {
            if (err) return res.status(500).json({ error: err.message });
            data.frequentMood = freqRow ? freqRow.mood : 'N/A';
            res.json(data);
        });
    });
});

// Error handling for 404 (important to return JSON instead of HTML)
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
