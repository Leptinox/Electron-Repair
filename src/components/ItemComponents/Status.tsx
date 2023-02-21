import { Button, Spinner } from '@chakra-ui/react';
import {
  MinusIcon,
  CheckIcon,
  CheckCircleIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { ItemStatus } from '../../data/data-context';

interface Props {
  itemStatus: ItemStatus;
  onClick(): void;
  isDisabled: boolean;
}

const Status = ({ itemStatus, onClick, isDisabled }: Props) => {
  const getItemStatus = () => {
    switch (itemStatus) {
      case ItemStatus.Unset:
        return <MinusIcon />;
      case ItemStatus.Run:
        return <CheckIcon />;
      case ItemStatus.CheckSuccess:
        return <CheckCircleIcon color="gray.600" boxSize={6} />;
      case ItemStatus.QuickSuccess:
        return <CheckCircleIcon boxSize={6} color="green.500" />;
      case ItemStatus.FullSuccess:
        return <CheckCircleIcon boxSize={6} color="blue.500" />;
      case ItemStatus.Error:
        return <CloseIcon color="red.500" />;
      default:
        return '';
    }
  };

  if (itemStatus === ItemStatus.Loading) {
    return (
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.300"
        color="blue.500"
        size="lg"
        width="45px"
        marginX="5px"
      />
    );
  }
  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      {getItemStatus()}
    </Button>
  );
};

export default Status;
