import { Badge } from '@chakra-ui/react';
import type { LeadQualificationStatus } from '../../types';

interface LeadStatusBadgeProps {
  status: LeadQualificationStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  new: {
    label: 'New',
    colorPalette: 'blue',
  },
  contacted: {
    label: 'Contacted',
    colorPalette: 'cyan',
  },
  qualified: {
    label: 'Qualified',
    colorPalette: 'green',
  },
  unqualified: {
    label: 'Unqualified',
    colorPalette: 'gray',
  },
  converted: {
    label: 'Converted',
    colorPalette: 'purple',
  },
  lost: {
    label: 'Lost',
    colorPalette: 'red',
  },
};

export const LeadStatusBadge = ({ status, size = 'md' }: LeadStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge
      colorPalette={config.colorPalette}
      size={size}
      borderRadius="full"
      px={3}
      py={1}
      textTransform="capitalize"
      fontSize="xs"
    >
      {config.label}
    </Badge>
  );
};
