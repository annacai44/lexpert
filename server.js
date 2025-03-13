const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { getFirstAuthors } = require("./utils/apiUtils.js");
require("dotenv").config();

const app = express();
const port = 5002;

const path = require("path");

app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(cors());
app.use(express.json());

// Store conversations in memory (use a database for production)
let userSessions;

const API_KEY = process.env.REACT_APP_API_KEY;
console.log("🗝️ OpenAI API Key Loaded:", !!API_KEY);

// ✅ **LOGGING: Check API key exists**
if (!API_KEY) {
  console.error("🚨 ERROR: Missing OpenAI API Key! Add it to your .env file.");
  process.exit(1); // Stop server if no API key
}

// **Fetch First Authors Route**
app.get("/api/getFirstAuthors", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  console.log("🔎 Searching for authors on topic:", query);
  try {
    const authors = await getFirstAuthors(query);
    console.log("✅ Found authors:", authors);
    res.json(authors);
  } catch (error) {
    console.error("❌ Error fetching authors:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

// **Chat Route with Web Search**
app.post("/api/chat", async (req, res) => {
    const { message, firstRequest } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: "Missing message in request body" });
    }
  
    console.log("\n📩 **Received Chat Request**");
    console.log("🔹 Message:", message);
    console.log("🔹 First Request:", firstRequest);
  
    // Clear previous messages when starting a new topic
    if (firstRequest) {
      console.log("🆕 Starting new conversation...");
      userSessions = [];
      userSessions.push({ role: "system", content: "You are a helpful assistant." });
    }
  
    userSessions.push({ role: "user", content: message });
  
    try {
      console.log("🌍 Calling OpenAI API with web search...");
  
      const response = await axios.post(
          "https://api.openai.com/v1/responses",
          {
            model: "gpt-4o",
            tools: [{ type: "web_search_preview" }], 
            tool_choice: { type: "web_search_preview" },
            input: message, 
          },
          { headers: { Authorization: `Bearer ${API_KEY}` } }
      );      
  
      console.log("✅ OpenAI API response received.");
      console.log("📝 Full Response:", JSON.stringify(response.data, null, 2));
  
      // ✅ Fix: Extract correct response field
      let assistantReply = "No response available";
      
      if (response.data && response.data.output) {
        const messageItem = response.data.output.find(item => item.type === "message");
        if (messageItem && messageItem.content) {
            const textResponse = messageItem.content.find(entry => entry.type === "output_text");
            if (textResponse && textResponse.text) {
                assistantReply = textResponse.text;
            }
        }
    }
  
      console.log("📝 Assistant Reply (Fixed):", assistantReply);
  
      userSessions.push({ role: "assistant", content: assistantReply });
  
      res.json({ response: assistantReply });
  
    } catch (error) {
      console.error("❌ OpenAI API Error:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Failed to fetch response from OpenAI API." });
    }
  });
  

// Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
