import { SimpleGrid, Box, HStack, VStack, Text, Heading, Icon, Badge } from '@chakra-ui/react';
import type { LeadStats as LeadStatsType } from '../../types';
import { 
  FiTrendingUp, 
  FiTrendingDown,
  FiUsers, 
  FiAward, 
  FiCheckCircle 
} from 'react-icons/fi';

interface LeadStatsProps {
  stats: LeadStatsType;
  isLoading?: boolean;
}

export const LeadStats = ({ stats, isLoading = false }: LeadStatsProps) => {
  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: <FiUsers />,
      iconBg: 'purple.100',
      iconColor: 'purple.600',
      change: '+12%',
    },
    {
      title: 'New Leads',
      value: stats.statusCounts.new || 0,
      icon: <FiTrendingUp />,
      iconBg: 'pink.100',
      iconColor: 'pink.600',
      change: '+8%',
    },
    {
      title: 'Qualified',
      value: stats.statusCounts.qualified || 0,
      icon: <FiAward />,
      iconBg: 'blue.100',
      iconColor: 'blue.600',
      change: '+15%',
    },
    {
      title: 'Converted',
      value: stats.statusCounts.converted || 0,
      icon: <FiCheckCircle />,
      iconBg: 'green.100',
      iconColor: 'green.600',
      change: '+23%',
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
      {statCards.map((stat) => {
        const isPositive = stat.change.startsWith('+');
        
        return (
          <Box
            key={stat.title}
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
                  fontSize="xs"
                  fontWeight="semibold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {stat.title}
                </Text>
                <Heading 
                  size={{ base: '2xl', md: '3xl' }} 
                  color="gray.900"
                  lineHeight="1.1"
                  fontWeight="bold"
                >
                  {isLoading ? '...' : stat.value}
                </Heading>
              </VStack>
              
              <Box
                p={{ base: 2.5, md: 3 }}
                bg={stat.iconBg}
                borderRadius="lg"
                boxShadow="sm"
              >
                <Icon 
                  as={() => stat.icon} 
                  w={{ base: 5, md: 6 }} 
                  h={{ base: 5, md: 6 }} 
                  color={stat.iconColor} 
                />
              </Box>
            </HStack>

            <HStack gap={2} align="center">
              <Icon
                as={isPositive ? FiTrendingUp : FiTrendingDown}
                w={3.5}
                h={3.5}
                color={isPositive ? 'green.600' : 'red.600'}
              />
              <Badge
                colorPalette={isPositive ? 'green' : 'red'}
                size="sm"
                variant="subtle"
                fontSize="xs"
                px={2}
                py={0.5}
              >
                {stat.change}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                vs last month
              </Text>
            </HStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};
