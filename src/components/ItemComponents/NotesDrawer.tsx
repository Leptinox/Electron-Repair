import { useContext } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Stack,
} from '@chakra-ui/react';
import DataContext, { Note } from '../../data/data-context';
import NoteItem from './NoteItem';

interface Props {
  itemNotes: Note[];
  sectionId: number;
  itemId: number;
  subItemId: number | null;
  finalFocusRef: any;
  isOpen: boolean;
  onClose: any;
}

const NotesDrawer = ({
  isOpen,
  onClose,
  finalFocusRef,
  itemNotes,
  sectionId,
  itemId,
  subItemId,
}: Props) => {
  const ctx = useContext(DataContext);

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={finalFocusRef}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Notes</DrawerHeader>
        <DrawerBody>
          {itemNotes.map((note: Note) => (
            <NoteItem
              note={note}
              sectionId={sectionId}
              itemId={itemId}
              subItemId={subItemId || null}
              key={note.id}
            />
          ))}
          <Stack>
            <Button
              colorScheme="purple"
              onClick={() =>
                subItemId
                  ? ctx.onSubItemNoteAdd(sectionId, itemId, subItemId)
                  : ctx.onItemAddNote(sectionId, itemId)
              }
            >
              Add Note
            </Button>
          </Stack>
        </DrawerBody>
        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
};

export default NotesDrawer;
