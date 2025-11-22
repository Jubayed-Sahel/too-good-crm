import { Box, Text, VStack, HStack, Badge, Spinner } from '@chakra-ui/react';
import { Card } from '../common';
import { FiAward } from 'react-icons/fi';
import { formatCurrency } from '@/utils';
import { useTopPerformers } from '@/hooks/useAnalytics';

// Simple Avatar component
const Avatar = ({ name, size = 'md', bg }: { name: string; size?: string; bg?: string }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizes = {
    sm: { w: '8', h: '8', fontSize: 'xs' },
    md: { w: '10', h: '10', fontSize: 'sm' },
    lg: { w: '12', h: '12', fontSize: 'md' },
  };

  const sizeProps = sizes[size as keyof typeof sizes] || sizes.md;

  return (
    <Box
      w={sizeProps.w}
      h={sizeProps.h}
      borderRadius="full"
      bg={bg || 'blue.500'}
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="semibold"
      fontSize={sizeProps.fontSize}
    >
      {getInitials(name)}
    </Box>
  );
};

const TopPerformers = () => {
  const { data: performers, isLoading, error } = useTopPerformers('revenue', 5);

  if (isLoading) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Spinner size="lg" />
          <Text color="gray.500">Loading top performers...</Text>
        </VStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated">
        <VStack justify="center" py={8}>
          <Text color="red.500">Failed to load top performers</Text>
        </VStack>
      </Card>
    );
  }

  const performersList = performers || [];
  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'yellow';
      case 1: return 'gray';
      case 2: return 'orange';
      default: return 'blue';
    }
  };

  return (
    <Card variant="elevated">
      <VStack align="stretch" gap={4}>
        <HStack gap={2} align="center">
          <Box color="purple.600">
            <FiAward size={18} />
          </Box>
          <Text 
            fontSize="sm" 
            fontWeight="semibold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Top Performers
          </Text>
        </HStack>

        <VStack align="stretch" gap={3}>
          {performersList.length > 0 ? (
            performersList.map((performer: any, index: number) => (
            <HStack
              key={performer.name}
              gap={3}
              p={3}
              borderRadius="lg"
              bg={index === 0 ? 'blue.50' : 'transparent'}
              _hover={{ bg: 'gray.50' }}
              transition="all 0.2s"
            >
              <Box position="relative">
                <Avatar
                  name={performer.name}
                  size="md"
                  bg={`${getRankColor(index)}.500`}
                />
                {index < 3 && (
                  <Badge
                    position="absolute"
                    bottom="-2px"
                    right="-2px"
                    borderRadius="full"
                    colorPalette={getRankColor(index)}
                    fontSize="xs"
                    minW="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {index + 1}
                  </Badge>
                )}
              </Box>

              <VStack align="stretch" gap={0} flex="1">
                <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                  {performer.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {performer.role}
                </Text>
              </VStack>

              <VStack align="end" gap={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">
                  {formatCurrency(performer.revenue)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {performer.deals} deals
                </Text>
              </VStack>
            </HStack>
            ))
          ) : (
            <Box py={4} textAlign="center">
              <Text color="gray.500" fontSize="sm">No performer data available</Text>
            </Box>
          )}
        </VStack>
      </VStack>
    </Card>
  );
};

export default TopPerformers;
