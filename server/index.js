const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { naive, kmp, rabinKarp } = require('./algorithms');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// API to compare algorithms
app.post('/api/compare', (req, res) => {
    const { text, pattern } = req.body;

    if (!text || (pattern === undefined)) {
        return res.status(400).json({ error: 'Text and pattern are required' });
    }

    const naiveResult = naive(text, pattern);
    const kmpResult = kmp(text, pattern);
    const rkResult = rabinKarp(text, pattern);

    res.json({
        naive: naiveResult,
        kmp: kmpResult,
        rabinKarp: rkResult
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
