import {
  VStack,
  HStack,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  AccordionIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  AppData,
  SectionItem,
  ItemStatus,
  ItemFlag,
  Note,
  SubItemType,
} from '../data/data-context';
import Item from './ItemComponents/Item';

interface ScriptResult {
  itemNotes: Note[];
  output: string[];
  subItems: string[];
}

interface Props {
  section: AppData;
  onItemChange: (
    sectionId: number,
    itemId: number,
    newItem: SectionItem
  ) => void;
  onItemAdd: (sectionId: number) => void;
}

enum RunType {
  CheckRun,
  QuickRun,
  FullRun,
}

const Section = ({ section, onItemChange, onItemAdd }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const selectAll = () => {
    section.sectionItems.forEach((item: SectionItem) => {
      if (item.scriptFile) {
        item.itemStatus = ItemStatus.Run;
        onItemChange(section.id, item.id, item);
      }
    });
  };

  const selectDefault = () => {
    section.sectionItems.forEach((item: SectionItem) => {
      if (
        item.default &&
        item.scriptFile &&
        item.itemStatus !== ItemStatus.CheckSuccess &&
        item.itemStatus !== ItemStatus.FullSuccess
      ) {
        item.itemStatus = ItemStatus.Run;
      } else if (!item.default && !item.itemCustom) {
        item.itemStatus = ItemStatus.Unset;
      }
      onItemChange(section.id, item.id, item);
    });
  };

  const unsetAll = () => {
    section.sectionItems.forEach((item: SectionItem) => {
      item.itemStatus = ItemStatus.Unset;
      onItemChange(section.id, item.id, item);
    });
  };

  const parseScriptResult = (scriptResult: ScriptResult, item: SectionItem) => {
    if (scriptResult.output.length > 0) {
      item.scriptOutput = [];
      scriptResult.output.forEach((output) => {
        if (item.scriptOutput) {
          item.scriptOutput.push(output);
        }
      });
    }
    scriptResult.itemNotes?.forEach((note) => {
      const newNote: Note = {
        publish: true,
        noteTitle: note.noteTitle,
        noteBody: note.noteBody,
        id: Math.random(),
      };
      item.itemNotes.push(newNote);
    });
    scriptResult.subItems?.forEach((title) => {
      const newSubItem: SubItemType = {
        subItemTitle: title,
        subItemStatus: ItemStatus.Unset,
        id: Math.random(),
        subItemNotes: [],
        subItemFlag: ItemFlag.Manual,
      };
      item.itemSubItems.push(newSubItem);
    });
  };

  const resetSection = () => {
    section.sectionItems.forEach((item: SectionItem) => {
      if (item.scriptFile) {
        item.itemStatus = ItemStatus.Unset;
      }
      item.itemNotes = [];
      item.itemSubItems = [];
      item.itemFlag = ItemFlag.Unset;
      onItemChange(section.id, item.id, item);
    });
  };

  const runScript = async (
    item: SectionItem,
    runType: string,
    successStatus: ItemStatus
  ) => {
    if (!item.scriptFile) {
      window.electron.message.show(
        'No script file found',
        `A script file was not found for item title: ${item.itemTitle}`,
        'error'
      );
      return;
    }
    item.itemStatus = ItemStatus.Loading;
    onItemChange(section.id, item.id, item);
    const [stdout, err] = await window.electron.store.run(
      item.scriptFile,
      item.itemCustom,
      runType
    );
    if (!err) {
      item.itemStatus = successStatus;
    } else {
      item.itemStatus = ItemStatus.Error;
      item.itemFlag = ItemFlag.Auto;
    }
    item.scriptLog = window.electron.store.get(item.scriptFile);
    item.scriptExitCode = Number(err);
    if (item.itemCustom) {
      try {
        const result = JSON.parse(stdout);
        parseScriptResult(result, item);
      } catch (e) {
        // Script not using the module for script output
        item.scriptOutput = [stdout];
      }
    } else {
      try {
        const result = JSON.parse(stdout);
        parseScriptResult(result, item);
      } catch (e) {
        // The JSON was invalid, `e` has some further information
        window.electron.message.show(
          'Error parsing script output',
          `${e}\nPlease review the script log file for more information`,
          'error'
        );
        item.scriptOutput = [stdout];
      }
    }
    onItemChange(section.id, item.id, item);
  };

  const sectionRun = (runType: RunType) => {
    switch (runType) {
      case RunType.CheckRun:
        section.sectionItems.forEach(async (item: SectionItem) => {
          if (
            item.itemStatus !== ItemStatus.Unset &&
            item.itemStatus !== ItemStatus.CheckSuccess &&
            item.scriptFile
          ) {
            runScript(item, 'check', ItemStatus.CheckSuccess);
          }
        });
        break;
      case RunType.QuickRun:
        section.sectionItems.forEach(async (item: SectionItem) => {
          if (
            item.itemStatus !== ItemStatus.Unset &&
            item.scriptFile &&
            item.itemStatus !== ItemStatus.CheckSuccess &&
            item.itemStatus !== ItemStatus.FullSuccess
          ) {
            runScript(item, 'repair', ItemStatus.QuickSuccess);
          }
        });
        break;
      case RunType.FullRun:
        section.sectionItems.forEach(async (item: SectionItem) => {
          if (
            item.itemStatus !== ItemStatus.Unset &&
            item.scriptFile &&
            item.itemStatus !== ItemStatus.CheckSuccess &&
            item.itemStatus !== ItemStatus.FullSuccess
          ) {
            runScript(item, 'repair', ItemStatus.FullSuccess);
          }
        });
        break;
      default:
        break;
    }
  };

  return (
    <AccordionItem key={section.id}>
      {({ isExpanded }) => (
        <>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <h1 style={{ fontSize: '17px', fontWeight: '400' }}>
                  {section.sectionTitle}
                </h1>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Reset {section.sectionTitle}?</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>All custom items and notes will be removed</Text>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="red" mr={3} onClick={() => resetSection()}>
                  Confirm
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <AccordionPanel pb={4}>
            {isExpanded && (
              <VStack>
                <Button size="sm" onClick={onOpen}>
                  Reset section
                </Button>
                {section.sectionItems.map((item: SectionItem) => (
                  <Item item={item} sectionId={section.id} key={item.id} />
                ))}
                <Button
                  style={{ marginBottom: '20px' }}
                  onClick={() => onItemAdd(section.id)}
                >
                  Add Item
                </Button>
                <HStack>
                  <Button onClick={() => selectDefault()}>
                    Quick Selection
                  </Button>
                  <Button onClick={() => selectAll()}>Select All</Button>
                  <Button onClick={() => unsetAll()}>Unselect All</Button>
                </HStack>
                <HStack>
                  <Button
                    colorScheme="blue"
                    onClick={() => sectionRun(RunType.CheckRun)}
                  >
                    Start Check Run
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={() => sectionRun(RunType.FullRun)}
                  >
                    Start Repair Run
                  </Button>
                </HStack>
              </VStack>
            )}
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  );
}

export default Section;
