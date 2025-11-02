import { HStack, Text } from '@chakra-ui/react';
import { ProgressBar, ProgressRoot } from '../ui/progress';

interface LeadScoreIndicatorProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'orange';
  return 'red';
};

export const LeadScoreIndicator = ({ 
  score, 
  showLabel = true,
  size = 'md' 
}: LeadScoreIndicatorProps) => {
  const colorPalette = getScoreColor(score);
  const height = size === 'sm' ? '4px' : size === 'md' ? '6px' : '8px';

  return (
    <HStack gap={3} w="full">
      <ProgressRoot
        value={score}
        maxW={showLabel ? '120px' : 'full'}
        flex="1"
        colorPalette={colorPalette}
        size={size}
      >
        <ProgressBar height={height} />
      </ProgressRoot>
      {showLabel && (
        <Text fontSize="sm" fontWeight="medium" color="gray.600" minW="40px">
          {score}/100
        </Text>
      )}
    </HStack>
  );
};
