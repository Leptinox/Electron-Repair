import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Stack,
  useBreakpointValue,
  useColorModeValue,
  FormControl,
  VStack,
  HStack,
  PinInput,
  PinInputField,
  Center,
  useToast,
} from '@chakra-ui/react';
import Users from './data/Users';
import Logo from './Logo';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = (value: string) => {
    const userFound = Users.filter((user: User) => {
      if (user.password === value) {
        return user;
      }
      return null;
    });
    if (userFound[0]) {
      navigate('/sectionOne');
      window.electron.store.set('user', JSON.stringify(userFound[0]));
    } else {
      toast({
        title: 'Error',
        description: 'Invalid PIN. Please try again',
        status: 'error',
        duration: 1500,
        isClosable: true,
      });
    }
  };

  /*   useEffect(() => {
    const user = window.electron.store.get('user');
    if (user) navigate('/sectionOne');
    else navigate('/');
  }, [navigate]); */

  return (
    <Container
      maxW="lg"
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
    >
      <Stack spacing="8">
        <Stack spacing="6">
          <Logo />
          <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={useBreakpointValue({ base: 'xs', md: 'sm' })}>
              Log in
            </Heading>
          </Stack>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useBreakpointValue({ base: 'transparent', sm: 'bg-surface' })}
          boxShadow={{ base: 'none', sm: useColorModeValue('md', 'md-dark') }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <Stack spacing="6">
            <Stack spacing="5">
              <FormControl>
                <Center>
                  <VStack>
                    <Heading size="md">Enter PIN:</Heading>
                    <HStack>
                      <PinInput onComplete={(value) => handleLogin(value)} mask>
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                      </PinInput>
                    </HStack>
                  </VStack>
                </Center>
              </FormControl>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default Auth;
