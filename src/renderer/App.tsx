import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Main from '../components/pages/Main';
import theme from './theme';
import { DataContextProvider } from '../data/data-context';

// Components
import SectionOne from '../components/SectionOne';
import Auth from '../auth/Auth';

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <DataContextProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/sectionOne" element={<SectionOne />} />
            <Route path="/main" element={<Main />} />
          </Routes>
        </Router>
      </DataContextProvider>
    </ChakraProvider>
  );
}
