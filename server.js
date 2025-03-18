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

// Store expert data globally
let storedExperts = {}; // { topic: { author: { articles: [...], details: "OpenAI Response" } } }
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

        // Store authors globally
        storedExperts[query] = {};
        topicConversations[query] = [];
        for (const [author, articles] of Object.entries(authors)) {
            storedExperts[query][author] = { articles, description: null }; // Store articles, but description will be fetched later
        }

        res.json(authors);
    } catch (error) {
        console.error("Error fetching authors:", error.response || error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/chat", async (req, res) => {
    const { message, firstRequest, topic, author } = req.body;
    console.log("heyyyy,", message);

    if (!message || !topic) {
        return res.status(400).json({ error: "Missing message or topic" });
    }

    // Ensure topic exists in storedExperts
    if (!storedExperts[topic]) {
        return res.status(400).json({ error: "Topic not found. Fetch authors first." });
    }

    if (firstRequest) {
        console.log("adding initialPrompt to messages");
        topicConversations[topic].push({
            role: "system",
            content: `You are a helpful assistant. ${message}`,
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

        console.log("messages!!:", topicConversations[topic]);

        // // Store the response in our global storage
        storedExperts[topic][author].description = assistantReply;

        console.log("storedExperts:", storedExperts);

        res.json(assistantReply);
    } catch (error) {
        console.error("OpenAI API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});


// Route for filtering/refining expert results
app.post("/api/filterExperts", (req, res) => {
    const { topic, filterRequest } = req.body;

    if (!topic || !storedExperts[topic]) {
        return res.status(400).json({ error: "No stored experts found for this topic." });
    }

    console.log(`Filtering experts for topic: ${topic} with request: ${filterRequest}`);

    const allExperts = Object.entries(storedExperts[topic]).map(([author, data]) => ({
        author,
        articles: data.articles,
        details: data.details,
    }));

    // You could apply additional filtering logic here based on `filterRequest`

    res.json(allExperts);
});

app.listen(port, () => console.log("Server running on port 5002"));
