import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, CircularProgress, Box } from '@mui/material';
import "./Homepage.css";
import axios from "axios";
import ReactMarkdown from 'react-markdown';

function Homepage() {
  const [topic, setTopic] = useState("");
  const [perplexityResponse, setPerplexityResponse] = useState(null);
  const [sentRequest, setSentRequest] = useState(false);
  const [authorNames, setAuthorNames] = useState([]);
  
  const systemMessage = "Be precise and concise. The more information you provide, the better the results.";
  const userRequest = `Here is a list of people who wrote papers related to ${topic}: ${authorNames}. For each author, provide the person's position, expertise, and contact information found from any professional sites. Number each person. Only include people who are alive or not retired today. For each person, provide a 1 paragraph summary on why they are a good expert on ${topic} based on papers they've written from Google Scholar or other pieces of their work. Give citations in the summary paragraph linking to specific papers they've written from Google Scholar.`;

  const getAuthors = async (topic) => {
    try {
      const response = await axios.get(`http://localhost:5002/api/getFirstAuthors?query=${topic}`);
      setAuthorNames(response.data.map(author => author.name));
    } catch (error) {
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request error:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
    }
  };

  useEffect(() => {
    if (authorNames.length > 0) {
      sendPerplexityRequest();
    }
  }, [authorNames]);

  const sendPerplexityRequest = async () => {
    setSentRequest(true);
      try {
        console.log(userRequest);
          const response = await axios.post("http://localhost:5002/api/chat", {
              model: "sonar",
              messages: [
                  { role: "system", content: systemMessage },
                  { role: "user", content: userRequest }
              ],
              max_tokens: 4096,
              temperature: 0.7
          });

          setPerplexityResponse(response.data);
      } catch (error) {
          console.error(error);
      }
  };

  const handleChange = (event) => {
    setTopic(event.target.value);
  }

  return (
    <Container maxWidth="md">
      <div className="input-area">
        <Typography variant="h2">
          Find me experts on...
        </Typography>
        
        <div id="issue-textfield">
          <TextField
            fullWidth
            placeholder="Enter in a topic. e.g. Marbury vs. Madison decision."
            multiline
            rows={4}
            onChange={handleChange}
          />
        </div>
        <Button onClick={() => getAuthors(topic)} id="legal-expert-button" variant="contained">Find a legal expert!</Button>
      </div>

      <Typography variant="h2">
          Results
      </Typography>

      {perplexityResponse ? 
      <ReactMarkdown className="response">{perplexityResponse.choices[0].message.content}</ReactMarkdown>: 
        sentRequest ?
        <Box id="loading-icon">
          <CircularProgress />
        </Box> :
        <Typography className="no-response-placeholder" variant="h5">
            Input a topic above.
        </Typography>
      }
    </Container>
  )
}

export default Homepage