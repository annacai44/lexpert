const express = require("express");
const cors = require("cors");
const axios = require("axios");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://api.perplexity.ai/chat/completions";
const API_KEY = process.env.REACT_APP_API_KEY;

app.post("/api/chat", async (req, res) => {
    try {
        const response = await axios.post(API_URL, req.body, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(5002, () => console.log("Server running on port 5002"));
