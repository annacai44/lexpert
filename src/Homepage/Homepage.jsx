import React, { useState } from 'react';
import { Container, TextField, Button, Typography, CircularProgress, Box } from '@mui/material';
import "./Homepage.css";
import axios from "axios";


function Homepage() {
  const [topic, setTopic] = useState("");
  const [perplexityResponse, setPerplexityResponse] = useState(null);

  const systemMessage = "Be precise and concise. The more information you provide, the better the results.";
  const userRequest = `Find me legal experts on ${topic}. Provide the person's position, expertise, and perspective. Number each person.`;

  const sendRequest = async () => {
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
          Find me legal experts on...
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
        <Button onClick={sendRequest} id="legal-expert-button" variant="contained">Find a legal expert!</Button>
      </div>

      <Typography variant="h2">
          Results
      </Typography>

      {perplexityResponse ? 
        <Typography variant="h5" id="response-text">{perplexityResponse.choices[0].message.content}</Typography> : 
        <Box id="loading-icon">
          <CircularProgress />
        </Box>
      }
    </Container>
  )
}

export default Homepage