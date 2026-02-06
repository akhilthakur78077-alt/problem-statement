require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/ai/summarize', (req, res) => {
    const text = req.body.text;

    // Simple AI simulation (since no OpenAI key now)
    const summary = text.substring(0, 60) + "...";

    res.json({
        result: "Summary: " + summary
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
