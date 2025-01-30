import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import "./Homepage.css";

function Homepage() {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event) => {
    setInputValue(event.target.value);
  }

  return (
    <Container maxWidth="md">
      <div className="input-area">
        <Typography variant="h2">
          Find me an expert on...
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
    </Container>
  )
}

export default Homepage