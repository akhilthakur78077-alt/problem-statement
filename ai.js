const express = require('express');
const router = express.Router();

// Offline AI fallback summarizer
router.post("/summarize", async (req, res) => {

    const email = req.body.text;

    // Simple rule-based summarization for hackathon demo
    let summary = "Summary: " + email.split(".")[0];

    let action = "Action: Please check the mentioned tasks.";
    let category = "Category: Academic Notice";
    let deadline = "Deadline: Extracted dates if present";

    res.json({
        result: summary + "\n" + action + "\n" + category + "\n" + deadline
    });

});

module.exports = router;
