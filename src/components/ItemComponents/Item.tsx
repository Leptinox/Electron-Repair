import { useContext } from 'react';
import {
  HStack,
  VStack,
  Box,
  Divider,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Heading,
  Tooltip,
  chakra,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  ArrowLeftIcon,
  DeleteIcon,
  PlusSquareIcon,
  AttachmentIcon,
  InfoOutlineIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import DataContext, {
  ItemStatus,
  ItemFlag,
  SubItemType,
  SectionItem,
} from 'data/data-context';
import NotesButton from './NotesButton';
import SubItem from './SubItem';
import Status from './Status';
import Flag from './Flag';

type Props = {
  item: SectionItem;
  sectionId: number;
};

const Item = ({ item, sectionId }: Props) => {
  const ctx = useContext(DataContext);

  const onTitleChange = (event: { target: { value: string } }) => {
    const { value } = event.target;
    item.itemTitle = value;
    ctx.onItemChange(sectionId, item.id, item);
  };

  const onClear = () => {
    item.itemFlag = ItemFlag.Unset;
    item.itemStatus = ItemStatus.Unset;
    item.itemNotes = [];
    item.scriptExitCode = -1;
    item.scriptOutput = null;
    if (item.itemCustom) {
      item.scriptFile = '';
    }
    ctx.onItemChange(sectionId, item.id, item);
  };

  const onGetPath = async () => {
    window.electron.fs.getpath(item.id.toString());
    if (window.electron.store.get(item.id.toString())) {
      item.itemStatus = ItemStatus.Run;
    }
    item.scriptFile = window.electron.store.get(item.id.toString());
    ctx.onItemChange(sectionId, item.id, item);
  };

  const getScLog = () => {
    if (item.scriptFile) {
      item.scriptLog = window.electron.store.get(item.scriptFile);
      ctx.onItemChange(sectionId, item.id, item);
    }
  };

  const onStatusChange = (status: ItemStatus) => {
    if (status === ItemStatus.Loading) {
      return;
    }
    if (status === ItemStatus.Run) {
      item.itemStatus = ItemStatus.Unset;
    } else {
      item.itemStatus = ItemStatus.Run;
    }
    ctx.onItemChange(sectionId, item.id, item);
  };

  const onFlagChange = (flag: ItemFlag) => {
    if (item.itemFlag === ItemFlag.Auto) {
      item.itemFlag = ItemFlag.Resolved;
    } else if (flag >= 2) {
      item.itemFlag = 0;
    } else {
      item.itemFlag += 1;
    }
    ctx.onItemChange(sectionId, item.id, item);
  };

  const execute = async () => {
    if (item.scriptFile) {
      await window.electron.store.run(item.scriptFile, item.itemCustom, 'exec');
    } else {
      window.electron.message.show(
        'No script file found',
        `Cannot open program since the script file was not found for item title: ${item.itemTitle}`,
        'error'
      );
    }
  };

  return (
    <>
      <Divider />
      <HStack width="100%">
        <Tooltip label="Status">
          <Status
            onClick={() => onStatusChange(item.itemStatus)}
            itemStatus={item.itemStatus}
            isDisabled={item.scriptFile === null}
          />
        </Tooltip>
        <Tooltip label="Flag">
          <Flag
            onClick={() => onFlagChange(item.itemFlag)}
            itemFlag={item.itemFlag}
          />
        </Tooltip>
        {item.itemCustom && (
          <>
            <Button onClick={() => onGetPath()}>
              <AttachmentIcon />
              {item.scriptFile && (
                <chakra.span
                  pos="absolute"
                  top="-1px"
                  right="-1px"
                  px={1}
                  py={1}
                  fontSize="xs"
                  fontWeight="bold"
                  lineHeight="none"
                  bg="green.600"
                  transform="translate(50%,-50%)"
                  rounded="full"
                >
                  <Tooltip label={item.scriptFile} closeOnClick={false}>
                    Script
                  </Tooltip>
                </chakra.span>
              )}
            </Button>
          </>
        )}

        <Tooltip label="Add sub-item" closeOnClick={false}>
          <Button onClick={() => ctx.onSubItemAdd(sectionId, item.id)}>
            <PlusSquareIcon boxSize={5} />
          </Button>
        </Tooltip>

        {!item.itemCustom && (
          <Heading
            lineHeight="tall"
            size="sm"
            style={{
              width: '100%',
              textAlign: 'center',
            }}
          >
            {item.itemTitle}
            {item.executable && (
              <Button variant="link" onClick={() => execute()}>
                <ExternalLinkIcon />
              </Button>
            )}
          </Heading>
        )}

        {item.itemCustom && (
          <>
            <Heading
              lineHeight="tall"
              size="sm"
              style={{
                width: '100%',
                textAlign: 'center',
              }}
            >
              <Editable
                placeholder="Click to edit..."
                defaultValue={item.itemTitle}
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
            <Box width="76px" />
          </>
        )}
        {item.description.length > 0 && (
          <Tooltip label="Description" closeOnClick={false}>
            <Popover isLazy>
              <PopoverTrigger>
                <Button>
                  <InfoOutlineIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader fontWeight="semibold">Description</PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  {item.description.map((itemDescription: string) => (
                    <Text key={item.id + itemDescription}>
                      {itemDescription}
                    </Text>
                  ))}
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Tooltip>
        )}
        <NotesButton
          sectionId={sectionId}
          itemId={item.id}
          subItemId={null}
          isSubItem={false}
          itemNotes={item.itemNotes}
        />
        <Tooltip label="Clear item" closeOnClick={false}>
          <Button colorScheme="yellow" onClick={() => onClear()}>
            <ArrowLeftIcon />
          </Button>
        </Tooltip>

        {item.itemCustom && (
          <Tooltip label="Delete Item" closeOnClick={false}>
            <Button
              colorScheme="red"
              onClick={() => ctx.onItemRemove(sectionId, item.id)}
            >
              <DeleteIcon />
            </Button>
          </Tooltip>
        )}
      </HStack>

      {item.scriptExitCode === 0 && item.scriptOutput && (
        <Alert
          status="success"
          variant="subtle"
          textAlign="center"
          justifyContent="center"
          flexDirection="column"
        >
          <HStack spacing={0}>
            <AlertIcon />
            <AlertTitle>Success</AlertTitle>
          </HStack>
          <AlertDescription>
            {item.scriptOutput.map((output: string) => (
              <Text noOfLines={50}>{output}</Text>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {item.scriptExitCode === 1 && item.scriptOutput && (
        <>
          <Alert
            status="error"
            variant="subtle"
            textAlign="center"
            justifyContent="center"
            flexDirection="column"
          >
            <HStack spacing={0}>
              <AlertIcon />
              <AlertTitle>Script Failed</AlertTitle>
            </HStack>
            <AlertDescription>
              {item.scriptOutput.map((output: string) => (
                <Text noOfLines={50}>{output}</Text>
              ))}
            </AlertDescription>
          </Alert>

          <Popover>
            <PopoverTrigger>
              <Button onClick={() => getScLog()}>Script log</Button>
            </PopoverTrigger>
            <PopoverContent width="600px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontSize="sm">
                Script log for{' '}
                {item.itemCustom
                  ? `${item.scriptFile}`
                  : `${item.scriptFile}.ps1`}
              </PopoverHeader>
              <PopoverBody fontSize="sm">{item.scriptLog}</PopoverBody>
            </PopoverContent>
          </Popover>
        </>
      )}

      {item.scriptExitCode === 2 && item.scriptOutput && (
        <Alert
          status="warning"
          variant="subtle"
          textAlign="center"
          justifyContent="center"
          flexDirection="column"
        >
          <HStack spacing={0}>
            <AlertIcon />
            <AlertTitle>Issues found</AlertTitle>
          </HStack>
          <AlertDescription>
            {item.scriptOutput.map((output: string) => (
              <Text noOfLines={50}>{output}</Text>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {item.itemSubItems.map((subItem: SubItemType) => (
        <VStack key={subItem.id} style={{ width: '100%' }}>
          <SubItem subItem={subItem} sectionId={sectionId} itemId={item.id} />
        </VStack>
      ))}
      <Divider />
    </>
  );
};

export default Item;
