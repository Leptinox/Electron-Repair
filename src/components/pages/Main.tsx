import { useContext } from 'react';
import {
  Button,
  HStack,
  useToast,
  Accordion,
  ButtonGroup,
} from '@chakra-ui/react';
import DataContext, {
  SectionItem,
  AppData,
  ItemFlag,
  Note,
  SubItemType,
  ItemStatus,
} from 'data/data-context';
import Section from '../Section';

const Main = () => {
  const { data, onItemChange, onItemAdd } = useContext(DataContext);
  const toast = useToast();

  const getPublicNotes = (): string => {
    let publicNoteItems = '';
    let itemTitle = '';
    let sectionItems = '';
    let sectionNotes = '';
    let publicNotes = '';
    const sectionFooter = `=============================================\n\n`;
    data.forEach((section: AppData) => {
      let sectionHasNotes = false;
      sectionItems = '';
      const sectionTitle = `=================== ${section.sectionTitle} ===================\n\n`;
      section.sectionItems.forEach((item: SectionItem) => {
        if (item.itemNotes.length > 0) {
          sectionHasNotes = true;
          publicNoteItems = '';
          itemTitle = `=================== ${item.itemTitle} ===================\n`;
          let itemHasNotes = false;
          item.itemNotes.forEach((note: Note) => {
            if (note.publish) {
              // TODO: Fix output when note title or note body is empty
              itemHasNotes = true;
              publicNoteItems += `====== ${note.noteTitle} ======\n${note.noteBody}\n======\n\n`;
            }
          });
          if (itemHasNotes) {
            sectionItems += `${itemTitle}\n${publicNoteItems}`;
          }
        }
      });
      if (sectionHasNotes) {
        sectionNotes += `${sectionTitle}\n${sectionItems}\n${sectionFooter}`;
      }
    });
    publicNotes = sectionNotes;
    return publicNotes;
  };

  const getPrivateNotes = (): string => {
    let privateNotes = '';
    let itemOutput = '';
    let itemTitle = '';
    let itemScriptOutput = '';
    let sectionItems = '';
    let sectionNotes = '';
    let subItemNotes = '';
    const sectionFooter = `\n=============================================\n`;
    data.forEach((section: AppData) => {
      let sectionModified = false;
      sectionItems = '';
      const sectionTitle = `=================== ${section.sectionTitle} ===================`;
      section.sectionItems.forEach((item: SectionItem) => {
        if (
          item.itemFlag !== ItemFlag.Unset ||
          (item.itemStatus !== ItemStatus.Unset &&
            item.itemStatus !== ItemStatus.Run) ||
          item.itemNotes.length > 0 ||
          item.itemSubItems.length > 0
        ) {
          sectionModified = true;
          itemTitle = `=================== ${item.itemTitle} ===================\n`;
          if (item.scriptOutput) {
            item.scriptOutput.forEach((output) => {
              itemScriptOutput += output;
            });
          }
          item.itemSubItems?.forEach((subItem: SubItemType) => {
            subItemNotes += `====== ${subItem.subItemTitle} ======\n`;
            if (subItem.subItemNotes.length > 0) {
              subItem.subItemNotes.forEach((note: Note) => {
                subItemNotes += `====== ${note.noteTitle} ======\n${note.noteBody}\n======`;
              });
            }
          });
          itemOutput = `${itemTitle}\nScript Output:\n${itemScriptOutput}\n${subItemNotes}\n\n`;
          sectionItems += itemOutput;
        }
      });
      if (sectionModified) {
        sectionNotes += `${sectionTitle}\n${sectionItems}\n${sectionFooter}`;
      }
    });
    privateNotes = sectionNotes;
    return privateNotes;
  };

  const validateData = (appData: AppData[]): boolean => {
    let noActions = true;
    let itemLoading = false;
    let itemLoadingList = '';
    let warnings: (string | (string | null)[])[];
    warnings = [];
    appData.forEach((section: AppData) => {
      section.sectionItems.forEach((item: SectionItem) => {
        if (item.itemStatus === ItemStatus.Loading) {
          itemLoading = true;
          itemLoadingList += `${item.itemTitle}\n`;
        }
        if (
          item.itemFlag === ItemFlag.Auto ||
          item.itemFlag === ItemFlag.Manual
        ) {
          warnings = [
            ...warnings,
            [section.sectionTitle, item.itemTitle, null],
          ];
        }
        if (
          item.itemFlag !== ItemFlag.Unset ||
          (item.itemStatus !== ItemStatus.Unset &&
            item.itemStatus !== ItemStatus.Run)
        ) {
          noActions = false;
        }
        if (item.itemNotes.length > 0) {
          item.itemNotes.forEach((note: Note) => {
            if (note.publish) {
              noActions = false;
            }
          });
        }
        item.itemSubItems.forEach((subItem: SubItemType) => {
          if (
            subItem.subItemFlag === ItemFlag.Auto ||
            subItem.subItemFlag === ItemFlag.Manual
          ) {
            warnings = [
              ...warnings,
              [section.sectionTitle, item.itemTitle, subItem.subItemTitle],
            ];
          }
        });
      });
    });
    if (noActions) {
      toast({
        title: 'Unable to submit results',
        description: `No actions were taken`,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return true;
    }
    if (itemLoading) {
      toast({
        title: 'Script running',
        description: `Some of the scripts have not finished running:\n${itemLoadingList}`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
    if (warnings !== null && warnings.length > 0) {
      let warningItems = '';
      warnings.forEach((warning) => {
        warningItems += warning[2]
          ? `  [ ${warning[0]} -> ${warning[1]} -> ${warning[2]}\n ]  `
          : `  [ ${warning[0]} -> ${warning[1]}\n ]  `;
      });
      toast({
        title: 'Unable to submit results',
        description: `The following items need to be resolved:\n${warningItems}`,
        status: 'error',
        duration: 10000,
        isClosable: true,
      });
      return true;
    }
    return false;
  };

  const submitToSyncro = (): void => {
    const hasValidationErrors = validateData(data);
    if (hasValidationErrors) {
      return;
    }
    const privateNotes = getPrivateNotes();
    const publicNotes = getPublicNotes();
    const userData = JSON.parse(window.electron.store.get('user'));
    window.electron.syncro.submit(
      privateNotes,
      publicNotes,
      `${userData.first_name} ${userData.last_name}`
    );
  };

  const saveLocally = (): void => {
    const hasValidationErrors = validateData(data);
    if (hasValidationErrors) {
      return;
    }
    const userData = JSON.parse(window.electron.store.get('user'));
    const userName = `${userData.first_name} ${userData.last_name}`;
    window.electron.fs.savereport(userName, data);
  };

  const buttonContainerSyncro = {
    display: 'flex',
    width: '60%',
    alignItems: 'center',
    /* border: '1px solid white', */
    justifyContent: 'start',
  };

  const buttonContainer = {
    display: 'flex',
    width: '40%',
    alignItems: 'center',
    justifyContent: 'end',
  };

  const HStackContainer = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'end',
  };

  return (
    <>
      <Accordion allowToggle>
        {data.map((section: AppData) => (
          <Section
            section={section}
            onItemChange={onItemChange}
            onItemAdd={onItemAdd}
            key={section.id}
          />
        ))}
      </Accordion>

      <HStack style={HStackContainer}>
        <ButtonGroup style={buttonContainerSyncro} padding={0}>
          <br />
          <br />
          <br />
          <br />
          <Button onClick={() => submitToSyncro()}>Submit to Syncro</Button>
          <Button onClick={() => saveLocally()}>Save report locally</Button>
        </ButtonGroup>
        <ButtonGroup style={buttonContainer} gap="2" padding={0} />
      </HStack>
    </>
  );
}

export default Main;
