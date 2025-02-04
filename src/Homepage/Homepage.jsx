import React, { useState } from 'react';
import { Container, TextField, Button, Typography, CircularProgress, Box, Select, MenuItem, FormControl, InputLabel, } from '@mui/material';
import "./Homepage.css";
import axios from "axios";

function formatLegalExperts(text) {
  return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold formatting
      .replace(/(\d+)\.\s+<strong>(.*?)<\/strong>/g, "<br><br><strong>$1. $2</strong>") // Numbered list spacing
      .replace(/- \*\*(.*?)\*\*/g, "<br>- <strong>$1</strong>") // Bold within bullet points
      .replace(/\s*-\s+/g, "<br>- ") // Ensure bullet points are on new lines
      .trim();
}

function Homepage() {
  const [topic, setTopic] = useState("");
  const [perplexityResponse, setPerplexityResponse] = useState(null);
  const [sentRequest, setSentRequest] = useState(false);
  const [location, setLocation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [university, setUniversity] = useState("");
  
  const systemMessage = "Be precise and concise. The more information you provide, the better the results.";
  const userRequest = `Find me legal experts on ${topic}. Provide the person's position, description, expertise indented. Number each person. Only include people who are alive today. Do not output any other text other than the info above!`;

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
          Find me legal experts on...
        </Typography>

        {/* <FormControl fullWidth>
          <InputLabel>Location</InputLabel>
          <Select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            label="Location"
          >
            <MenuItem value="Illinois">Illinois</MenuItem>
            <MenuItem value="New York">New York</MenuItem>
            <MenuItem value="California">California</MenuItem>
            <MenuItem value="Texas">Texas</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Specialization</InputLabel>
          <Select
            value={specialization}
            onChange={(event) => setSpecialization(event.target.value)}
            label="Specialization"
          >
            <MenuItem value="Constitutional Law">Constitutional Law</MenuItem>
            <MenuItem value="Intellectual Property">Intellectual Property</MenuItem>
            <MenuItem value="Criminal Law">Criminal Law</MenuItem>
            <MenuItem value="Corporate Law">Corporate Law</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>University</InputLabel>
          <Select
            value={university}
            onChange={(event) => setUniversity(event.target.value)}
            label="University"
          >
            <MenuItem value="Northwestern University">Northwestern University</MenuItem>
            <MenuItem value="Harvard University">Harvard University</MenuItem>
            <MenuItem value="Yale University">Yale University</MenuItem>
            <MenuItem value="Stanford University">Stanford University</MenuItem>
            <MenuItem value="Columbia University">Columbia University</MenuItem>
          </Select>
        </FormControl> */}
        
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
        <div className="response" dangerouslySetInnerHTML={{ __html: formatLegalExperts(perplexityResponse.choices[0].message.content) }} /> : 
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