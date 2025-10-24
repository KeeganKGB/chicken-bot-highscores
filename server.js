const express = require('express');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes

// Home page - Display highscores
app.get('/', async (req, res) => {
    try {
        const highscores = await db.getHighscores(100);
        res.render('index', { highscores });
    } catch (err) {
        console.error('Error loading highscores:', err);
        res.status(500).render('error', {
            error: 'Failed to load highscores',
            message: err.message
        });
    }
});

// API endpoint - Get highscores (JSON)
app.get('/api/highscores', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const highscores = await db.getHighscores(limit);
        res.json({
            success: true,
            count: highscores.length,
            data: highscores
        });
    } catch (err) {
        console.error('Error fetching highscores:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch highscores',
            message: err.message
        });
    }
});

// API endpoint - Get specific user rank
app.get('/api/user/:username', async (req, res) => {
    try {
        const user = await db.getUserRank(req.params.username);
        if (user) {
            res.json({
                success: true,
                data: user
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user',
            message: err.message
        });
    }
});

// API endpoint - Update/Create score
app.post('/api/update', async (req, res) => {
    try {
        const { username, chickensKilled } = req.body;

        // Validation
        if (!username || chickensKilled === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: username, chickensKilled'
            });
        }

        if (typeof chickensKilled !== 'number' || chickensKilled < 0) {
            return res.status(400).json({
                success: false,
                error: 'chickensKilled must be a non-negative number'
            });
        }

        const result = await db.updateScore(username, chickensKilled);
        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Error updating score:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update score',
            message: err.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        error: '404 - Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Chicken Kicker Highscores server running on http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET  /api/highscores - Get all highscores`);
    console.log(`  GET  /api/user/:username - Get specific user`);
    console.log(`  POST /api/update - Update/create user score`);
});
