import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import "./Homepage.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import EmailButton from "../EmailButton/EmailButton";
import ExpertNames from "../ExpertNames";

function Homepage() {
  const [topic, setTopic] = useState("");
  const [openAIResponse, setOpenAIResponse] = useState(null);
  const [authorNames, setAuthorNames] = useState([]);
  const [filterRequest, setFilterRequest] = useState("");
  const [queryingAuthors, setQueryingAuthors] = useState(false);
  const [findingInfoOnExperts, setFindingInfoOnExperts] = useState(false);
  const [showAuthorNames, setShowAuthorNames] = useState(false);

  const getAuthors = async (topic) => {
    try {
      setQueryingAuthors(true);
      const response = await axios.get(
        `http://localhost:5002/api/getFirstAuthors?query=${topic}`
      );
      setAuthorNames(response.data);
    } catch (error) {
      if (error.response) {
        console.error("Response error:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request error:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
    }
  };

  useEffect(() => {
    if (authorNames && Object.keys(authorNames).length > 0) {
      setQueryingAuthors(false);
      setFindingInfoOnExperts(true);
      setShowAuthorNames(true);
      sendFirstOpenAIRequest();

      setTimeout(() => {
        setShowAuthorNames(false);
      }, 15000); // 15 seconds delay
    }
  }, [authorNames]);

  const formatAuthorNamesAndPapers = () => {
    if (authorNames) {
      return Object.entries(authorNames)
        .map(([author, papers]) => `${author}: ${papers.join(", ")}`)
        .join("\n");
    }
    return "";
  };

  const sendFirstOpenAIRequest = async () => {
    const formattedNamesAndPapers = formatAuthorNamesAndPapers();

    const newUserRequest = `Here is a list of people who wrote papers related to ${topic}. 
    Using the collected papers from Google Scholar and other online sources, provide the following for each author:
    - Full name in bold. 
    - Position (bolded) (e.g., university).
    - Expertise (bolded) (field of study, etc).
    - Background (bolded, labeled as 'Background.) summary explaining why they are a credible expert on ${topic}, and 
    also summarize (be specific) their papers attached and anything else you find out online about their work on this topic.' 
    - Only include people who are alive and active today (so double check that they are not dead)
    - Links (bolded) to their works and any other works you find yourself (make sure the hyperlink shows the title of the work)
    - Do not include anything else. If no information is available for an author, exclude them from the list.

    Here are the authors and their papers. If we get authors from the same paper only return the first author:
    ${formattedNamesAndPapers}
    `;

    try {
      const response = await axios.post("http://localhost:5002/api/chat", {
        message: newUserRequest,
      });

      setOpenAIResponse(response.data);
      setFindingInfoOnExperts(false);
    } catch (error) {
      console.error(error);
    }
  };

  const sendSubsequentOpenAIRequests = async () => {
    try {
      const response = await axios.post("http://localhost:5002/api/chat", {
        message: filterRequest,
      });
      setOpenAIResponse(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (event) => {
    setTopic(event.target.value);
  };

  const handleFilterRequest = (event) => {
    setFilterRequest(event.target.value);
  };

  return (
    <Container maxWidth="md">
      <div className="input-area">
        <Typography variant="h2">Find me experts on...</Typography>

        <div id="issue-textfield">
          <TextField
            fullWidth
            placeholder="Enter in a topic. e.g. Marbury vs. Madison decision."
            multiline
            rows={4}
            onChange={handleChange}
          />
        </div>
        <Button
          onClick={() => getAuthors(topic)}
          id="expert-button"
          variant="contained"
        >
          Find an expert!
        </Button>
      </div>

      <Typography variant="h2">Results</Typography>

      <div className="results-box">
        {openAIResponse ? (
          <div className="filter-input-box">
            <div className="filter-input-box">
              <TextField
                fullWidth
                placeholder="Narrow down results here. For example, 'I only want experts from Northwestern University.'"
                multiline
                rows={2}
                onChange={handleFilterRequest}
              />
              <Button
                onClick={sendSubsequentOpenAIRequests}
                id="expert-button"
                variant="contained"
              >
                Update results
              </Button>
            </div>
            <ReactMarkdown className="response">{openAIResponse}</ReactMarkdown>
          </div>
        ) : queryingAuthors ? (
          <div className="loading">
            <Typography className="placeholder-text" variant="h5">
              finding experts from Google Scholar...
            </Typography>
            <Box className="loading-icon">
              <CircularProgress />
            </Box>
          </div>
        ) : showAuthorNames ? (
          <ExpertNames names={Object.keys(authorNames)} />
        ) : findingInfoOnExperts ? (
          <div className="loading">
            <Typography className="placeholder-text" variant="h5">
              querying for information on experts found...
            </Typography>
            <Box className="loading-icon">
              <CircularProgress />
            </Box>
          </div>
        ) : (
          <Typography className="placeholder-text" variant="h5">
            Input a topic above.
          </Typography>
        )}
      </div>
    </Container>
  );
}

export default Homepage;
