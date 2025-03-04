const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { getFirstAuthors } = require("./utils/apiUtils.js");
require('dotenv').config();

const app = express();
const port = 5002;


// Serve React build files
const path = require('path');

// If you're serving a React app after building it
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.use(cors());
app.use(express.json());

// Store conversations in memory (use a database for production)
const userSessions = [];

const API_KEY = process.env.REACT_APP_API_KEY;
console.log("OpenAI API Key Loaded:", !!API_KEY);  // Should print true

// Define route to fetch first authors based on search query
app.get('/api/getFirstAuthors', async (req, res) => {
    const { query } = req.query;
  
    if (!query) {
      return res.status(400).send('Query parameter is required');
    }
  
    console.log(query);
    try {
        const authors = await getFirstAuthors(query);
        console.log("authors:", authors);
        res.json(authors);
    } catch (error) {
        console.error("error!", error.response);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Missing or message" });
    }

    if (userSessions.length === 0) {
        userSessions.push({ role: "system", content: "You are a helpful assistant." });
    }

    userSessions.push({ role: "user", content: message });

    try {
        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", 
                {
                    model: "gpt-4",
                    messages: userSessions
                }, 
                { headers: { Authorization: `Bearer ${API_KEY}` }}
            );

            const assistantReply = response.data.choices[0].message.content;
            userSessions.push({ role: "assistant", content: assistantReply });

            res.json(assistantReply);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log("Server running on port 5002"));
