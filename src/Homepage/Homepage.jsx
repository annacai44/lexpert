import React, { useState } from 'react';
import { Container, TextField, Button, Typography, CircularProgress, Box } from '@mui/material';
import "./Homepage.css";

function Homepage() {
  const [topic, setTopic] = useState("");

  const handleChange = (event) => {
    setTopic(event.target.value);
  }

  const systemMessage = "Be precise and concise. List names of real experts and their contact information (phone number and/or email). Give a link to their website if applicable. If you cannot find any experts, respond with 'No legal experts were found that fit your description.'";
  const userRequest = `Find me legal experts on ${topic}`;

  const options = {
    method: 'POST',
    headers: {Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`, 'Content-Type': 'application/json'},
    body: `{"model":"sonar","messages":[{"role":"system","content":${systemMessage}},{"role":"user","content":${userRequest}}],"max_tokens":"Optional","temperature":0.2,"top_p":0.9,"search_domain_filter":["perplexity.ai"],"return_images":false,"return_related_questions":false,"search_recency_filter":"month","top_k":0,"stream":false,"presence_penalty":0,"frequency_penalty":1,"response_format":null}`
  };
  
  fetch('https://api.perplexity.ai/chat/completions', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));

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
        <Button id="legal-expert-button" variant="contained">Find a legal expert!</Button>
      </div>

      <Box id="loading-icon">
        <CircularProgress />
      </Box>
    </Container>
  )
}

export default Homepage