import React, { useState } from 'react';
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
  const userRequest = `Find me legal experts on ${topic}. Provide the person's position, description, expertise indented. Number each person. Only include people who are alive today. Do not output any other text other than the info above!`;

  const getAuthors = async (topic) => {
    try {
      const response = await axios.get(`http://localhost:5002/api/getFirstAuthors?query=${topic}`);
      setAuthorNames(response.data);
    } catch (error) {
      // Log the full error details
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request error:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
    }
  };

  console.log("author names:", authorNames);
  const sendRequest = async () => {
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