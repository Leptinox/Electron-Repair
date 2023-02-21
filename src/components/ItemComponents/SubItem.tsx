import { useContext } from 'react';
import {
  EditablePreview,
  Box,
  Editable,
  Tooltip,
  EditableInput,
  Button,
  HStack,
  Heading,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import DataContext, { SubItemType, ItemFlag } from 'data/data-context';
import NotesButton from './NotesButton';
import Flag from './Flag';

interface Props {
  subItem: SubItemType;
  sectionId: number;
  itemId: number;
}

const SubItem = ({ subItem, sectionId, itemId }: Props) => {
  const ctx = useContext(DataContext);
  const onTitleChange = (event: { target: { value: string } }) => {
    const { value } = event.target;
    subItem.subItemTitle = value;
    ctx.onSubItemChange(sectionId, itemId, subItem.id, subItem);
  };
  const onFlagChange = (flag: ItemFlag) => {
    if (flag === ItemFlag.Resolved) {
      subItem.subItemFlag = ItemFlag.Manual;
    } else {
      subItem.subItemFlag = ItemFlag.Resolved;
    }
    ctx.onSubItemChange(sectionId, itemId, subItem.id, subItem);
  };

  return (
    <HStack
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Box w="63px" />

      <Tooltip label="Flag">
        <Flag
          onClick={() => onFlagChange(subItem.subItemFlag)}
          itemFlag={subItem.subItemFlag}
        />
      </Tooltip>
      <Box w="60px" />
      <Heading
        lineHeight="tall"
        size="sm"
        style={{
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Editable
          defaultValue={subItem.subItemTitle}
          placeholder="Click to edit..."
          isPreviewFocusable
          selectAllOnFocus={false}
        >
          <EditablePreview />
          <EditableInput
            onBlur={onTitleChange}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        </Editable>
      </Heading>
      <Tooltip label="Notes">
        <NotesButton
          sectionId={sectionId}
          itemId={itemId}
          subItemId={subItem.id}
          isSubItem
          itemNotes={subItem.subItemNotes}
        />
      </Tooltip>

      <Tooltip label="Delete sub-item">
        <Button
          colorScheme="red"
          onClick={() => ctx.onSubItemRemove(sectionId, itemId, subItem.id)}
        >
          <DeleteIcon />
        </Button>
      </Tooltip>
      <Box w="62px" />
    </HStack>
  );
};

export default SubItem;
