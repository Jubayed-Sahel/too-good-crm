import { VStack, Text, HStack, Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { StandardCard } from './StandardCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard = ({
  label,
  value,
  icon,
  color = 'gray.900',
  trend,
}: StatCardProps) => {
  return (
    <StandardCard>
      <VStack align="start" gap={2}>
        <HStack justify="space-between" w="100%">
          <Text
            fontSize="sm"
            color="gray.600"
            fontWeight="medium"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {label}
          </Text>
          {icon && <Box color="gray.400">{icon}</Box>}
        </HStack>
        
        <HStack align="baseline" gap={2}>
          <Text fontSize="3xl" fontWeight="bold" color={color}>
            {value}
          </Text>
          {trend && (
            <Text
              fontSize="sm"
              color={trend.isPositive ? 'green.600' : 'red.600'}
              fontWeight="medium"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Text>
          )}
        </HStack>
      </VStack>
    </StandardCard>
  );
};

export default StatCard;

