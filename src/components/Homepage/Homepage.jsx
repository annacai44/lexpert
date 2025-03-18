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
import ExpertNames from "../ExpertNames";

function Homepage() {
  const [topic, setTopic] = useState("");
  const [openAIResponse, setOpenAIResponse] = useState(null);

  // {author name: [list of article links]}
  const [authorNames, setAuthorNames] = useState({});
  const [filterRequest, setFilterRequest] = useState("");
  const [queryingAuthors, setQueryingAuthors] = useState(false);
  const [findingInfoOnExperts, setFindingInfoOnExperts] = useState(false);
  const [showAuthorNames, setShowAuthorNames] = useState(false);
  const [sentFilterRequest, setSentFilterRequest] = useState(false);
  const [finishedCollectingAuthorInfo, setFinishedCollectingAuthorInfo] = useState(false);

  const getAuthors = async (topic) => {
    setOpenAIResponse(false);
    setQueryingAuthors(true);
    try {
      const response = await axios.get(
        `http://localhost:5002/api/getFirstAuthors?query=${topic}`
      );
      console.log("author names:", response.data);
      setAuthorNames(response.data);
    } catch (error) {
      console.error(error);
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
      }, 12000); // 12 seconds delay
    }
  }, [authorNames]);

  const sendFirstOpenAIRequest = async () => {
    let combinedResponse = "";

    const initialPrompt = `You will receive a list of experts and their papers related to the topic ${topic}.  
    Your task is to format their information consistently and concisely.  
    Use the following structure for each expert:  
  
    - **Full Name** at the top in bold  
    - **Position** (university, organization)  
    - **Expertise** (field of study, research area)  
    - **Background** (why they are credible, based on papers and other sources)  
    - **Links** (hyperlinks to their works and related research)  
  
    Only include experts who are alive and active today. A list of experts and their papers will follow.`;
  
    try {
      await axios.post("http://localhost:5002/api/chat", {
        message: initialPrompt,
        firstRequest: true,
        topic,
        author: null
      });

      console.log('doneee');
  
      // Step 2: Send authors incrementally
      for (const [author, papers] of Object.entries(authorNames)) {
        const authorMessage = `Author: **${author}**  
        Papers: ${papers.join(", ")}`;
  
        console.log(`Sending author: ${author}`);
  
        const response = await axios.post("http://localhost:5002/api/chat", {
          message: authorMessage,
          firstRequest: false,
          topic,
          author: author
        });
  
        // Append response to the combined markdown string
        combinedResponse += `## ${author}\n\n${response.data}\n\n---\n\n`;

        setOpenAIResponse(combinedResponse);
      }
    } catch (error) {
      console.error(`Error fetching data:`, error);
    }

    setFindingInfoOnExperts(false);
    setFinishedCollectingAuthorInfo(true);
  };

  const sendSubsequentOpenAIRequests = async () => {
    setSentFilterRequest(true);
    try {
      const response = await axios.post("http://localhost:5002/api/filterExperts", {
        topic,
        filterRequest
      });
      setOpenAIResponse(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setSentFilterRequest(false); // Hide loading icon after response
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

      <div className="results-box">
        {openAIResponse ? (
          <div className="filter-input-box">
            <Typography variant="h2">Results</Typography>
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
              {sentFilterRequest && (
                <Box className="loading-icon">
                  <CircularProgress />
                </Box>
              )}
            </div>
            <ReactMarkdown className="response">{openAIResponse}</ReactMarkdown>
            {!finishedCollectingAuthorInfo && (
              <Box className="loading-icon">
                <CircularProgress />
              </Box>
            )}
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
        ) : null}
      </div>
    </Container>
  );
}

export default Homepage;
