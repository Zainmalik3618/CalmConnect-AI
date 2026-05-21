const express = require('express');
const cors = require('cors');
const apiRoutes = require('./api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Simple root route
app.get('/', (req, res) => {
    res.send('CalmConnect AI Backend is running.');
});

// Basic Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

module.exports = app;