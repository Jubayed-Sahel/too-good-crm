import { Box, Flex, Heading, Text, Icon, Badge } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change: string;
  iconBg: string;
  iconColor: string;
}

const StatCard = ({ title, value, icon, change, iconBg, iconColor }: StatCardProps) => {
  const isPositive = change.startsWith('+');

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="md"
      p={{ base: 4, md: 6 }}
      border="1px"
      borderColor="gray.100"
      _hover={{ boxShadow: 'lg' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Flex
          w={{ base: 10, md: 12 }}
          h={{ base: 10, md: 12 }}
          bg={iconBg}
          borderRadius="lg"
          align="center"
          justify="center"
        >
          <Icon as={() => icon} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} color={iconColor} />
        </Flex>
        <Badge
          colorPalette={isPositive ? 'green' : 'red'}
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          {change}
        </Badge>
      </Flex>
      <Text color="gray.600" fontSize="sm" fontWeight="medium" mb={1}>
        {title}
      </Text>
      <Heading size={{ base: 'lg', md: 'xl' }} color="gray.800">
        {value}
      </Heading>
    </Box>
  );
};

export default StatCard;
