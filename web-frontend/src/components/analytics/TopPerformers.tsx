import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { Card } from '../common';
import { FiAward } from 'react-icons/fi';
import { formatCurrency } from '@/utils';

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

interface TopPerformersProps {
  performers?: Array<{
    name: string;
    role: string;
    deals: number;
    revenue: number;
    avatar?: string;
  }>;
}

const TopPerformers = ({
  performers = [
    { name: 'John Smith', role: 'Sales Manager', deals: 24, revenue: 580000 },
    { name: 'Sarah Johnson', role: 'Sales Rep', deals: 19, revenue: 425000 },
    { name: 'Michael Chen', role: 'Sales Rep', deals: 16, revenue: 380000 },
    { name: 'Emily Davis', role: 'Account Manager', deals: 14, revenue: 340000 },
    { name: 'David Wilson', role: 'Sales Rep', deals: 12, revenue: 295000 },
  ]
}: TopPerformersProps) => {
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
        <HStack gap={2}>
          <FiAward size={20} color="#3182CE" />
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            Top Performers
          </Text>
        </HStack>

        <VStack align="stretch" gap={3}>
          {performers.map((performer, index) => (
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
          ))}
        </VStack>
      </VStack>
    </Card>
  );
};

export default TopPerformers;
