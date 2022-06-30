import React from 'react';
import {Box, AppBar, Toolbar, IconButton, Typography} from '@mui/material';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';

export default function Navbar() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{mr: 2}}>
            <CoronavirusIcon></CoronavirusIcon>
          </IconButton>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Gatex
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
