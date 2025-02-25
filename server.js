const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { getFirstAuthors } = require("./utils/apiUtils.js");
require('dotenv').config();

const app = express();
const port = 5002;

app.use(cors());
app.use(express.json());

const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.REACT_APP_API_KEY;

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
    console.log("body:", req.body);
    try {
        try {
            const response = await axios.post(API_URL, req.body, {
                headers: { Authorization: `Bearer ${API_KEY}` }
            });
            console.log("response:", response.data);
            res.json(response.data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
        // const response = await axios.post(API_URL, req.body, {
        //     headers: { Authorization: `Bearer ${API_KEY}` }
        // });
        // console.log("response:", response.data);
        // res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log("Server running on port 5002"));
