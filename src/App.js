import './App.css';
import Homepage from './Homepage/Homepage';
import {AppBar, Toolbar, Typography} from '@mui/material';

function App() {
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Lexpert
          </Typography>
        </Toolbar>
      </AppBar>
      <Homepage />
    </div>
  );
}

export default App;