import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, CircularProgress, Box } from '@mui/material';
import "./Homepage.css";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import EmailButton from '../EmailButton/EmailButton';

function Homepage() {
  const [topic, setTopic] = useState("");
  const [openAIResponse, setOpenAIResponse] = useState(null);
  const [waitingForAPIResponse, setWaitingForAPIResponse] = useState(false);
  const [authorNames, setAuthorNames] = useState([]);
  const [filterRequest, setFilterRequest] = useState("");

  const getAuthors = async (topic) => {
    setWaitingForAPIResponse(true);
    try {
      const response = await axios.get(`http://localhost:5002/api/getFirstAuthors?query=${topic}`);
      setAuthorNames(response.data);
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
    if (authorNames && Object.keys(authorNames).length > 0) {
      sendFirstOpenAIRequest();
    }
  }, [authorNames]);  

  const formatAuthorNamesAndPapers = () => {
    if (authorNames) {
      return Object.entries(authorNames)
        .map(([author, papers]) => `${author}: ${papers.join(", ")}`)
        .join("\n");
    }
    return "";
  }
  
  const sendFirstOpenAIRequest = async () => {
    const formattedNamesAndPapers = formatAuthorNamesAndPapers();

    const newUserRequest = `Here is a list of people who wrote papers related to ${topic}. 
    Using the collected papers from Google Scholar and other online sources, provide the following for each author: 
    - Full name in bold. 
    - Position (bolded) (e.g., university).
    - Expertise (bolded) (field of study, etc).
    - Background (bolded, labeled as 'Background.) summary explaining why they are a credible expert on ${topic}, and 
    also summarize (be specific) their papers attached and anything else you find out online about their work on this topic.' 
    - Only include people who are alive and active today.
    - Links (bolded) to their works and any other works you find yourself
    - Do not include anything else. If no information is available for an author, exclude them from the list.

    Here are the authors and their papers. If we get authors from the same paper only return the first author:
    ${formattedNamesAndPapers}
    `;

    try {
      console.log(newUserRequest);

      const response = await axios.post("http://localhost:5002/api/chat", {message: newUserRequest });
  
      setOpenAIResponse(response.data);
      setWaitingForAPIResponse(false);
    } catch (error) {
      console.error(error);
    }
  };

  const sendSubsequentOpenAIRequests = async () => {
    try {
      console.log("filter request:", filterRequest);
      const response = await axios.post("http://localhost:5002/api/chat", {message: filterRequest });
      setOpenAIResponse(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  console.log("openAI response:", openAIResponse);

  const handleChange = (event) => {
    setTopic(event.target.value);
  }

  const handleFilterRequest = (event) => {
    setFilterRequest(event.target.value);
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
        <Button onClick={() => getAuthors(topic)} id="expert-button" variant="contained">Find an expert!</Button>
      </div>

      <Typography variant="h2">
          Results
      </Typography>

      {openAIResponse && !waitingForAPIResponse ? 
      <div className="filter-input-box">
        <div className="filter-input-box">
          <TextField
              fullWidth
              placeholder="Narrow down results here. For example, 'I only want experts from Northwestern University.'"
              multiline
              rows={2}
              onChange={handleFilterRequest}
          />
          <Button onClick={sendSubsequentOpenAIRequests} id="expert-button" variant="contained">Update results</Button>
        </div>
        <ReactMarkdown className="response">{openAIResponse}</ReactMarkdown>
      </div>
    : 
        waitingForAPIResponse ?
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