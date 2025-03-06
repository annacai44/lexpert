import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";

function ExpertNames({ names, speed = 50, nameDelay = 100 }) {
  const [displayedNames, setDisplayedNames] = useState([]); // List of fully typed names
  const [currentName, setCurrentName] = useState(""); // Name currently being typed
  const [nameIndex, setNameIndex] = useState(0); // Index of the name being typed
  const [charIndex, setCharIndex] = useState(0); // Index of the character being typed

  useEffect(() => {
    if (nameIndex < names.length) {
      if (charIndex < names[nameIndex].length) {
        // Type one character at a time
        const timeout = setTimeout(() => {
          setCurrentName((prev) => prev + names[nameIndex][charIndex]);
          setCharIndex((prev) => prev + 1);
        }, speed);

        return () => clearTimeout(timeout);
      } else {
        // Once a name is fully typed, move to the next name after a short delay
        const timeout = setTimeout(() => {
          setDisplayedNames((prev) => [...prev, currentName]); // Add full name to list
          setCurrentName(""); // Reset for next name
          setCharIndex(0); // Reset character index
          setNameIndex((prev) => prev + 1); // Move to next name
        }, nameDelay);

        return () => clearTimeout(timeout);
      }
    }
  }, [charIndex, nameIndex, names, currentName, speed, nameDelay]);

  return (
    <div>
        <Typography className="placeholder-text" variant="h5">
            finding experts from Google Scholar...
        </Typography>
        {displayedNames.map((name, i) => (
            <Typography variant="subtitle1" key={i}>{name}</Typography> // Show fully typed names
        ))}
        {currentName && <Typography variant="subtitle1">{currentName}</Typography>} {/* Show the currently typing name */}
    </div>
  );
}

export default ExpertNames;
