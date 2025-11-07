import { Box, Container, Flex, Heading, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiCalendar } from 'react-icons/fi';

const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    console.log('Signing out...');
    navigate('/login');
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Box 
      bg="white" 
      boxShadow="sm" 
      borderBottomWidth="1px" 
      borderColor="gray.200"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="7xl" py={4}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <HStack gap={3}>
            <Box
              w="10"
              h="10"
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="md"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Box>
            <VStack align="start" gap={0}>
              <Heading
                size="md"
                bgGradient="linear(to-r, purple.600, blue.600)"
                bgClip="text"
                fontWeight="bold"
              >
                LeadGrid
              </Heading>
              <HStack gap={1.5} color="gray.500">
                <FiCalendar size={12} />
                <Text fontSize="xs">
                  {currentDate}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <HStack gap={3}>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              colorPalette="gray"
              size="sm"
              _hover={{
                bg: 'gray.100',
              }}
            >
              <Flex align="center" gap={2}>
                <FiLogOut />
                <Text display={{ base: 'none', md: 'block' }}>Sign Out</Text>
              </Flex>
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default DashboardHeader;
