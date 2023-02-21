import { useRef } from 'react';
import {
  IconButton,
  Button,
  chakra,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import NotesDrawer from './NotesDrawer';
import { Note } from '../../data/data-context';

interface Props {
  sectionId: number;
  itemId: number;
  itemNotes: Note[];
  isSubItem: boolean;
  subItemId: number | null;
}

const NotesButton = ({
  isSubItem,
  itemNotes,
  itemId,
  subItemId,
  sectionId,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  const publishedNotesCount = () => {
    let numberOfNotes = 0;
    itemNotes.forEach((note) => {
      if (note.publish) {
        numberOfNotes += 1;
      }
    });
    return numberOfNotes;
  };
  if (isSubItem && subItemId !== null) {
    return (
      <>
        <IconButton
          aria-label="label"
          size="md"
          icon={
            <>
              <Tooltip label="Private notes">
                <Button ref={btnRef} onClick={onOpen} colorScheme="teal">
                  <EditIcon />
                </Button>
              </Tooltip>
              <NotesDrawer
                itemNotes={itemNotes}
                itemId={itemId}
                sectionId={sectionId}
                subItemId={subItemId}
                finalFocusRef={btnRef}
                isOpen={isOpen}
                onClose={onClose}
              />
              {itemNotes.length > 0 && (
                <Tooltip label="Published Notes">
                  <chakra.span
                    pos="absolute"
                    top="-1px"
                    right="-1px"
                    px={2}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                    lineHeight="none"
                    color="red.100"
                    transform="translate(50%,-50%)"
                    bg="red.600"
                    rounded="full"
                  >
                    {itemNotes.length}
                  </chakra.span>
                </Tooltip>
              )}
            </>
          }
        />
      </>
    );
  }
  return (
    <>
      <IconButton
        aria-label="label"
        size="md"
        icon={
          <>
            <Tooltip label="Public notes">
              <Button ref={btnRef} onClick={onOpen} colorScheme="teal">
                <EditIcon />
              </Button>
            </Tooltip>
            <NotesDrawer
              itemNotes={itemNotes}
              itemId={itemId}
              sectionId={sectionId}
              subItemId={subItemId}
              finalFocusRef={btnRef}
              isOpen={isOpen}
              onClose={onClose}
            />
            {publishedNotesCount() > 0 && (
              <Tooltip label="Published Notes">
                <chakra.span
                  pos="absolute"
                  top="-1px"
                  right="-1px"
                  px={2}
                  py={1}
                  fontSize="xs"
                  fontWeight="bold"
                  lineHeight="none"
                  color="red.100"
                  transform="translate(50%,-50%)"
                  bg="red.600"
                  rounded="full"
                >
                  {publishedNotesCount()}
                </chakra.span>
              </Tooltip>
            )}
          </>
        }
      />
    </>
  );
};

export default NotesButton;
