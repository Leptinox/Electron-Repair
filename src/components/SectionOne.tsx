import { Container } from '@chakra-ui/react';
import Main from './pages/Main';
import NavBar from './navigation/NavBar';

function SectionOne() {
  return (
    <>
      <NavBar />
      <br />
      <Container maxWidth={950} size="lg">
        <Main />
      </Container>
    </>
  );
}

export default SectionOne;
