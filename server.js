const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend files from public folder
app.use(express.static('public'));

app.post('/ai/summarize', (req, res) => {

    const text = req.body.text;

    if (!text) {
        return res.json({ result: "Please enter some text" });
    }

    // Simple local summarizer logic
    let summary;

    if (text.length <= 60) {
        summary = text;
    } else {
        summary = text.substring(0, 120) + "...";
    }

    res.json({
        result: "Summary: " + summary
    });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
