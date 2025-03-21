import React, { useState, useEffect, useRef } from "react";
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
  const resultsRef = useRef(null);

  // {author name: [list of article links]}
  const [authorNames, setAuthorNames] = useState({});
  const [filterRequest, setFilterRequest] = useState("");
  const [queryingAuthors, setQueryingAuthors] = useState(false);
  const [findingInfoOnExperts, setFindingInfoOnExperts] = useState(false);
  const [showAuthorNames, setShowAuthorNames] = useState(false);
  const [sentFilterRequest, setSentFilterRequest] = useState(false);
  const [finishedCollectingAuthorInfo, setFinishedCollectingAuthorInfo] = useState(false);
  const [userBackground, setUserBackground] = useState("");

  const getAuthors = async () => {
    setOpenAIResponse(false);
    setQueryingAuthors(true);
    setFinishedCollectingAuthorInfo(false);
    try {
      const response = await axios.post(
        "http://localhost:5002/api/getFirstAuthors",
        {topic, userBackground}
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

  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [openAIResponse]);

  const sendFirstOpenAIRequest = async () => {
    let combinedResponse = "";

    const initialPrompt = `You will receive a list of experts and their papers related to the topic ${topic}.  
    Your task is to format their information consistently and concisely. If you notice the same expert twice because of abbreviations, make sure you only use one of them!
    Use the following structure for each expert:  

    - **Position** (university, organization)  
    - **Expertise** (field of study, research area)  
    - **Background** (why they are credible, based on papers and other sources), 2-4 sentences.
    - **Links** (hyperlinks to their works and related research, make sure the hyperlink is ONLY the TITLE of the paper).
  
    Only include experts who are alive and active today. A list of experts and their papers will follow.
    
    Exmaple Format:::::
    Gene Grossman
      - Position: Professor of Economics, Princeton University
      - Expertise: International Trade and Political Economy
      - Background: Professor GM Grossman is a prolific author in the field of economics, especially where it pertains to international trade and political economy. His accolades include his renowned article on 'Trade Wars and Trade Talks' which details the role of domestic politics in the negotiation of international trade agreements and the resulting potential for trade wars.
      - Links: Trade Wars and Trade Talks`;
  
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

  const updateTopic = (event) => {
    setTopic(event.target.value);
  };

  const updateUserBackground = (event) => {
    setUserBackground(event.target.value);
  };

  const handleFilterRequest = (event) => {
    setFilterRequest(event.target.value);
  };

  return (
    <Container maxWidth="md">
      <div className="input-area">
        <div className="issue-textfield">
          <Typography className="input-question" variant="h3">What's your background?</Typography>
          <TextField
            fullWidth
            placeholder="Describe your background and purpose. e.g., 'I'm a journalist for The New York Times covering trade policy' or 'I'm a researcher studying AI ethics.'"
            multiline
            rows={3}
            onChange={updateUserBackground}
          />
        </div>

        <div className="issue-textfield">
          <Typography className="input-question" variant="h3">I need to find experts on...</Typography>
          <TextField
            fullWidth
            placeholder="Enter in a topic. e.g., 'Marbury vs. Madison decision'."
            multiline
            rows={3}
            onChange={updateTopic}
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
            <Typography variant="h3">Results</Typography>
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

        <div ref={resultsRef} />
      </div>
    </Container>
  );
}

export default Homepage;
