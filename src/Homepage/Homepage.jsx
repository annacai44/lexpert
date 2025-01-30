import React from 'react';
import { Container, TextField, Button } from '@mui/material';
import "./Homepage.css";

function Homepage() {
  return (
    <Container maxWidth="sm">
        <div id="issue-textfield">
          <TextField
            fullWidth
            placeholder="Enter in your issue."
            multiline
            rows={10}
            maxRows={10}
          />
        </div>
        <Button id="legal-expert-button" variant="contained">Find a legal expert!</Button>
    </Container>
  )
}

export default Homepage