import {useState} from 'react';
import {Box, Paper, Toolbar, Typography, Tabs, Tab, BoxProps} from '@mui/material';
import Api from './Api';
import App from './App';

export default function CreateService({sx, ...rest}: BoxProps) {
  const [currentTab, setCurrentTab] = useState('api');

  return (
    <Box sx={{mt: 2, ...sx}} {...rest}>
      <Paper>
        <Toolbar>
          <Typography sx={{position: 'absolute'}} variant="h5">
            创建服务
          </Typography>
          <Tabs
            sx={{width: '100%'}}
            value={currentTab}
            onChange={(_, key) => setCurrentTab(key)}
            centered
          >
            <Tab label="API" value={'api'} />
            <Tab label="APP" value={'app'} />
          </Tabs>
        </Toolbar>
        <Box sx={{px: 3, pb: 2}}>
          {currentTab === 'api' ? <Api></Api> : null}
          {currentTab === 'app' ? <App></App> : null}
        </Box>
      </Paper>
    </Box>
  );
}
