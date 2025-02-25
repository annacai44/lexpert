import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, CircularProgress, Box } from '@mui/material';
import "./Homepage.css";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import EmailButton from '../EmailButton/EmailButton';

function Homepage() {
  const [topic, setTopic] = useState("");
  const [OpenAIResponse, setOpenAIResponse] = useState(null);
  const [sentRequest, setSentRequest] = useState(false);
  const [authorNames, setAuthorNames] = useState([]);
  
  const systemMessage = "Be precise and concise. The more information you provide, the better the results.";
  const userRequest = `Here is a list of people who wrote papers related to ${topic}: ${authorNames}. For each author, 
  provide the author's full name in bold, then under their name, list their position, expertise, and email. For each author, 
  also provide a 1 paragraph summary on why they are a good expert on ${topic} based on papers 
  they've written from Google Scholar or other pieces of their work, and label this as Background. Number each person. Only include 
  people who are alive or not retired today. Do not include anything else except for the list! Do not say that there was unsufficient 
  information on the author. If there is no information on the author, do not include them in the list.`;

  const getAuthors = async (topic) => {
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

  console.log("userRequest:", userRequest);
  console.log("author names:", authorNames);
  useEffect(() => {
    if (authorNames && Object.keys(authorNames).length > 0) {
      sendOpenAIRequest();
    }
  }, [authorNames]);  

  const formatAuthorNames = () => {
    if (authorNames) {
      return Object.keys(authorNames).map(name => `${name}`).join(", ");
    }
    return "";
  }


  const formatAuthorNamesAndPapers = () => {
    if (authorNames) {
      return Object.entries(authorNames)
        .map(([author, papers]) => `${author}: ${papers.join(", ")}`)
        .join("\n");
    }
    return "";
  }
  
  

  const sendOpenAIRequest = async () => {
    setSentRequest(true);
    const formattedNames = formatAuthorNames();
    const formattedNamesAndPapers = formatAuthorNamesAndPapers();

    // const newUserRequest = `Here is a list of people who wrote papers related to ${topic}: ${formattedNames}. For each author, 
    // provide the author's full name in bold, then under their name, list their position, expertise, and email. For each author, 
    // also provide a 1 paragraph summary on why they are a good expert on ${topic} based on papers 
    // they've written from Google Scholar or other pieces of their work, and label this as Background. Number each person. Only include 
    // people who are alive or not retired today. Do not include anything else except for the list! Do not say that there was insufficient 
    // information on the author. If there is no information on the author, do not include them in the list.`;

    // const newUserRequest = `Here is a list of people who wrote papers related to ${topic}: ${formattedNames}. Provide brief information about each author.`;
    
//     const newUserRequest = `Here is a list of people who wrote papers related to ${topic}: ${formattedNames}. Using the collected papers from Google Scholar and other online sources, provide the following for each author: 
// - Full name in bold. 
// - Position and expertise (e.g., university
// - expertise (field of study, etc). 
// - 1 paragraph summary explaining why they are a credible expert on ${topic}, labeled as 'Background.' 
// - Only include people who are alive and active today. 
// - Do not include anything else. If no information is available for an author, exclude them from the list.`;

// const newUserRequest = `Here is a list of people who wrote papers related to ${topic}. 
// Using the collected papers from Google Scholar and other online sources, provide the following for each author: 
// - Full name in bold. 
// - Position (bolded) (e.g., university).
// - Expertise (bolded) (field of study, etc).
// - Background (bolded) 1 paragraph summary explaining why they are a credible expert on ${topic}, labeled as 'Background.' 
// - Only include people who are alive and active today.
// - Links (bolded) to their works and any other works you find yourself
// - Contact Information (bolded) contact information you can find from their schools websites which is public.
// - Do not include anything else. If no information is available for an author, exclude them from the list.

// Here are the authors and their papers: 
// ${formattedNamesAndPapers}
// `;

  const newUserRequest = `Here is a list of people who wrote papers related to ${topic}. 
Using the collected papers from Google Scholar and other online sources, provide the following for each author: 
- Full name in bold. 
- Position (bolded) (e.g., university).
- Expertise (bolded) (field of study, etc).
- Background (bolded) 1 paragraph summary explaining why they are a credible expert on ${topic}, labeled as 'Background.' 
- Only include people who are alive and active today.
- Links (bolded) to their works and any other works you find yourself
- Contact Information (bolded) contact information (phone, email, address) you can find from their schools websites which is public.
- Do not include anything else. If no information is available for an author, exclude them from the list.

Here are the authors and their papers: 
${formattedNamesAndPapers}
`;



    console.log("Executing OpenAI request...");
    console.log("Request Body:", {
      model: "gpt-4",
      messages: [
        { role: "user", content: newUserRequest }
      ],
      max_tokens: 4096,
      temperature: 0.7
    });
  
    try {
      console.log(newUserRequest);
      const response = await axios.post("http://localhost:5002/api/chat", {
        model: "gpt-4",
        messages: [
          { role: "user", content: newUserRequest }
        ],
        max_tokens: 4096,
        temperature: 0.7
      });
  
      setOpenAIResponse(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  

  console.log("openAI response:", OpenAIResponse);

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
        <Button onClick={() => getAuthors(topic)} id="expert-button" variant="contained">Find an expert!</Button>
      </div>

      <Typography variant="h2">
          Results
      </Typography>

      {OpenAIResponse ? 
      <ReactMarkdown className="response">{OpenAIResponse.choices[0].message.content}</ReactMarkdown>: 
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