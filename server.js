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

let topicConversations = {};

const API_KEY = process.env.REACT_APP_API_KEY;
console.log("OpenAI API Key Loaded:", !!API_KEY);  // Should print true

// Define route to fetch first authors based on search query
app.get('/api/getFirstAuthors', async (req, res) => {
    const { query } = req.query;
  
    if (!query) {
      return res.status(400).send('Query parameter is required');
    }
  
    console.log("Fetching authors for topic:", query);

    try {
        const authors = await getFirstAuthors(query);
        console.log("authors:", authors);

        topicConversations[query] = [];

        res.json(authors);
    } catch (error) {
        console.error("Error fetching authors:", error.response || error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/chat", async (req, res) => {
    const { message, firstRequest, topic, author } = req.body;

    if (!message || !topic) {
        return res.status(400).json({ error: "Missing message or topic" });
    }

    if (firstRequest) {
        console.log("adding initialPrompt to messages");
        topicConversations[topic].push({
            role: "system",
            content: `${message}`,
        });
        return res.json({});
    }

    topicConversations[topic].push({ role: "user", content: message });

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: topicConversations[topic],
            },
            { headers: { Authorization: `Bearer ${API_KEY}` } }
        );

        const assistantReply = response.data.choices[0].message.content;
        topicConversations[topic].push({"role": "assistant", "content": assistantReply});

        console.log("whole conversation so far:", topicConversations[topic]);

        res.json(assistantReply);
    } catch (error) {
        console.error("OpenAI API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});


// Route for filtering/refining expert results
app.post("/api/filterExperts", async (req, res) => {
    const { topic, filterRequest } = req.body;

    if (!topic || !filterRequest) {
        return res.status(400).json({ error: "Missing topic or filterRequest." });
    }

    const systemPrompt = `The user now wants to filter the experts down. You will receive a prompt from the user, and based on the prompt, 
    you should narrow down the experts that you have provided information about to only those that fit the filtering prompt. Keep all the 
    information for the experts the same.`;

    topicConversations[topic].push({"role": "system", "content": systemPrompt});
    topicConversations[topic].push({ role: "user", content: filterRequest });

    console.log(`Filtering experts for topic: ${topic} with request: ${filterRequest}`);

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: topicConversations[topic],
            },
            { headers: { Authorization: `Bearer ${API_KEY}` } }
        );

        const assistantReply = response.data.choices[0].message.content;
        topicConversations[topic].push({"role": "assistant", "content": assistantReply});

        console.log("whole conversation so far:", topicConversations[topic]);

        res.json(assistantReply);
    } catch (error) {
        console.error("OpenAI API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log("Server running on port 5002"));
