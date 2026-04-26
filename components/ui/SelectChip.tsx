import { AppChip } from '@/components/ui/AppChip';
import { SelectChipProps } from '@/types/common';

export default function SelectChip({ label, active, onPress }: SelectChipProps) {
  return <AppChip label={label} selected={active} onPress={onPress} />;
}
