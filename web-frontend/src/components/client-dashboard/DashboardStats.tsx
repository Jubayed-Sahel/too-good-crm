import { SimpleGrid, Box, HStack, VStack, Heading, Text } from '@chakra-ui/react';
import type { IconType } from 'react-icons';

interface StatItem {
  label: string;
  value: string;
  icon: IconType;
  color: string;
  change: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
      {stats.map((stat) => (
        <Box
          key={stat.label}
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          p={{ base: 5, md: 6 }}
          borderWidth="1px"
          borderColor="gray.200"
          _hover={{
            boxShadow: 'md',
            transform: 'translateY(-2px)',
            borderColor: 'gray.300',
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
                {stat.label}
              </Text>
              <Heading
                size={{ base: '3xl', md: '4xl' }}
                color="gray.900"
                lineHeight="1.1"
                fontWeight="bold"
              >
                {stat.value}
              </Heading>
            </VStack>

            <Box
              p={{ base: 3, md: 3.5 }}
              bg={`${stat.color}.100`}
              borderRadius="lg"
              boxShadow="sm"
              color={`${stat.color}.600`}
            >
              <stat.icon size={24} />
            </Box>
          </HStack>

          <Text fontSize="sm" color="gray.500">
            {stat.change}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default DashboardStats;
