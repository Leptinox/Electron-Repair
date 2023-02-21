import { Button } from '@chakra-ui/react';
import { WarningTwoIcon, CheckIcon } from '@chakra-ui/icons';
import { ItemFlag } from '../../data/data-context';

interface Props {
  itemFlag: ItemFlag;
  onClick(): void;
}

const Flag = ({ itemFlag, onClick }: Props) => {
  const getFlag = (flag: ItemFlag) => {
    switch (flag) {
      case ItemFlag.Unset:
        return '';
      case ItemFlag.Resolved:
        return <CheckIcon boxSize={5} color="green.500" />;
      case ItemFlag.Manual:
        return <WarningTwoIcon boxSize={5} color="red.500" />;
      case ItemFlag.Auto:
        return <WarningTwoIcon boxSize={5} color="gray.500" />;
      default:
        return '';
    }
  };

  return <Button onClick={onClick}>{getFlag(itemFlag)}</Button>;
};

export default Flag;
