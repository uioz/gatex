import React from 'react';
import ReactDOM from 'react-dom/client';
import {CssBaseline, StyledEngineProvider, Container} from '@mui/material';
import {useInitialStore, ProjectContext} from './store/project';
import Navbar from './components/Navbar';
import OnlineService from './components/OnlineService';
import CreateService from './components/CreateService';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

function Main() {
  const store = useInitialStore();

  return (
    <ProjectContext.Provider value={store}>
      <OnlineService></OnlineService>
      <CreateService sx={{mb: 2}}></CreateService>
    </ProjectContext.Provider>
  );
}

root.render(
  <React.StrictMode>
    <CssBaseline></CssBaseline>
    <StyledEngineProvider injectFirst>
      <Navbar></Navbar>
      <Container>
        <Main></Main>
      </Container>
    </StyledEngineProvider>
  </React.StrictMode>
);
