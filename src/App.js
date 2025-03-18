import './App.css';
import Homepage from './components/Homepage/Homepage';
import {AppBar, Toolbar, Typography} from '@mui/material';

function App() {
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar className="toolbar">
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            ExpertLink
          </Typography>
        </Toolbar>
      </AppBar>
      <Homepage />
    </div>
  );
}

export default App;