import { useContext } from 'react';
import {
  Divider,
  HStack,
  Box,
  Editable,
  EditablePreview,
  EditableInput,
  EditableTextarea,
  Switch,
  chakra,
  Flex,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import DataContext, { Note } from '../../data/data-context';

interface Props {
  note: Note;
  sectionId: number;
  itemId: number;
  subItemId: number | null;
}

const NoteItem = ({ subItemId, note, sectionId, itemId }: Props) => {
  const ctx = useContext(DataContext);

  const noteChange: Note = {
    noteTitle: note.noteTitle,
    noteBody: note.noteBody,
    id: note.id,
    publish: note.publish,
  };

  const onTitleChange = (event: { target: { value: string } }) => {
    const { value } = event.target;
    noteChange.noteTitle = value;
    if (subItemId) {
      ctx.onSubItemNoteChange(
        sectionId,
        itemId,
        subItemId,
        note.id,
        noteChange
      );
    } else {
      ctx.onItemNoteChange(sectionId, itemId, note.id, noteChange);
    }
  };

  const onBodyChange = (event: { target: { value: string } }) => {
    const { value } = event.target;
    noteChange.noteBody = value;
    if (subItemId) {
      ctx.onSubItemNoteChange(
        sectionId,
        itemId,
        subItemId,
        note.id,
        noteChange
      );
    } else {
      ctx.onItemNoteChange(sectionId, itemId, note.id, noteChange);
    }
  };

  const onSwitch = () => {
    if (note.publish) {
      noteChange.publish = false;
    } else {
      noteChange.publish = true;
    }
    ctx.onItemNoteChange(sectionId, itemId, note.id, noteChange);
  };
  return (
    <>
      <Divider />
      <br />
      <HStack>
        <Flex
          maxW="md"
          mx="auto"
          bg="white"
          _dark={{ bg: 'gray.800' }}
          shadow="lg"
          rounded="lg"
          overflow="hidden"
          style={{ width: '28em', opacity: '85%' }}
        >
          <Box w={2 / 3} p={{ base: 4, md: 4 }}>
            <chakra.h1
              fontSize="2xl"
              fontWeight="bold"
              color="gray.800"
              _dark={{ color: 'white' }}
            >
              <Editable
                defaultValue={note.noteTitle}
                placeholder="Note title..."
              >
                <EditablePreview maxWidth="14em" />
                <EditableInput
                  onBlur={onTitleChange}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                />
              </Editable>
            </chakra.h1>
            {!subItemId && (
              <FormControl
                style={{
                  display: 'flex',
                  position: 'relative',
                  left: '20em',
                  top: '-2em',
                }}
              >
                <FormLabel htmlFor="publish">Publish</FormLabel>
                <Switch
                  id="publish"
                  size="md"
                  defaultChecked={note.publish}
                  isChecked={note.publish}
                  onChange={() => onSwitch()}
                />
              </FormControl>
            )}
            <chakra.p
              mt={2}
              fontSize="sm"
              color="gray.600"
              _dark={{ color: 'gray.400' }}
            >
              <Editable
                defaultValue={note.noteBody}
                minWidth="415px"
                placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit In odit"
              >
                <EditablePreview />
                <EditableTextarea onBlur={onBodyChange} />
              </Editable>
            </chakra.p>

            <Flex mt={3} alignItems="center" justifyContent="space-between">
              <chakra.h1 color="white" fontWeight="bold" fontSize="lg" />
              <chakra.button
                px={2}
                py={1}
                bg="white"
                fontSize="xs"
                color="gray.900"
                fontWeight="bold"
                rounded="md"
                textTransform="uppercase"
                _hover={{
                  bg: 'gray.200',
                }}
                _focus={{
                  bg: 'gray.400',
                }}
                onClick={() =>
                  subItemId
                    ? ctx.onSubItemNoteRemove(
                        sectionId,
                        itemId,
                        subItemId,
                        note.id
                      )
                    : ctx.onItemNoteRemove(sectionId, itemId, note.id)
                }
                style={{ position: 'relative', left: '12.5em' }}
              >
                Remove
              </chakra.button>
            </Flex>
          </Box>
        </Flex>
      </HStack>
      <br />
    </>
  );
};

export default NoteItem;
