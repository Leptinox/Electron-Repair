import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  useDisclosure,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuDivider,
  Stack,
  useColorMode,
  Center,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import DataContext from '../../data/data-context';

function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const userData = JSON.parse(window.electron.store.get('user'));

  const navigate = useNavigate();

  const logout = () => {
    window.electron.store.delete('user');
    navigate('/');
  };

  const { onReset } = useContext(DataContext);
  const resetApp = async () => {
    await window.electron.store.reset();
    onReset();
  };

  return (
    <>
      <br />
      <Box px={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Box padding={10}>
            <h1 style={{ fontSize: '20px', fontWeight: '600' }}>
              Electron Repair
            </h1>
          </Box>
          <Flex alignItems="center" padding={10}>
            <Stack direction="row" spacing={7}>
              <Button onClick={onOpen}>Reset All</Button>
              <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Reset app?</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Text>All custom items and notes will be removed</Text>
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="red" mr={3} onClick={() => resetApp()}>
                      Confirm
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Tooltip label="Switch Theme" closeOnClick={false}>
                <Button onClick={toggleColorMode}>
                  {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                </Button>
              </Tooltip>

              <Menu isLazy>
                <Tooltip label="Profile" closeOnClick={false}>
                  <MenuButton
                    as={Button}
                    rounded="full"
                    variant="link"
                    cursor="pointer"
                    minW={0}
                  >
                    <Avatar
                      size="sm"
                      src="https://avatars.dicebear.com/api/bottts/:5.svg"
                    />
                  </MenuButton>
                </Tooltip>
                <MenuList alignItems="center">
                  <br />
                  <Center>
                    <Avatar
                      size="2xl"
                      src="https://avatars.dicebear.com/api/bottts/:5.svg"
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>
                      {userData.first_name ? `${userData.first_name} ` : ''}
                      {userData.last_name}
                    </p>
                  </Center>
                  <br />
                  <MenuDivider />
                  <Button onClick={logout} style={{ width: '100%' }}>
                    Logout
                  </Button>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}

export default NavBar;
