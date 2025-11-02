import { Box, Heading, Text, Icon, HStack, VStack, Badge } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

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
      boxShadow="sm"
      p={{ base: 5, md: 6 }}
      borderWidth="1px"
      borderColor="gray.200"
      _hover={{ 
        boxShadow: 'md',
        transform: 'translateY(-2px)',
        borderColor: 'gray.300'
      }}
      transition="all 0.2s ease-in-out"
      position="relative"
      overflow="hidden"
    >
      {/* Subtle gradient overlay */}
      <Box
        position="absolute"
        top={0}
        right={0}
        w="100px"
        h="100px"
        bgGradient="linear(to-br, transparent, gray.50)"
        opacity={0.5}
        pointerEvents="none"
      />
      
      <HStack justify="space-between" align="start" mb={4} position="relative">
        <VStack align="start" gap={1} flex={1}>
          <Text
            fontSize="sm"
            fontWeight="semibold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {title}
          </Text>
          <Heading 
            size={{ base: '3xl', md: '4xl' }} 
            color="gray.900"
            lineHeight="1.1"
            fontWeight="bold"
          >
            {value}
          </Heading>
        </VStack>
        
        <Box
          p={{ base: 3, md: 3.5 }}
          bg={iconBg}
          borderRadius="lg"
          boxShadow="sm"
        >
          <Icon 
            as={() => icon} 
            w={{ base: 6, md: 6 }} 
            h={{ base: 6, md: 6 }} 
            color={iconColor} 
          />
        </Box>
      </HStack>

      <HStack gap={2} align="center">
        <Icon
          as={isPositive ? FiTrendingUp : FiTrendingDown}
          w={4}
          h={4}
          color={isPositive ? 'green.600' : 'red.600'}
        />
        <Badge
          colorPalette={isPositive ? 'green' : 'red'}
          size="sm"
          variant="subtle"
          fontSize="sm"
          px={2}
          py={0.5}
        >
          {change}
        </Badge>
        <Text fontSize="sm" color="gray.500">
          vs last month
        </Text>
      </HStack>
    </Box>
  );
};

export default StatCard;
