import { Box, Container, Flex, Heading, Button, HStack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    console.log('Signing out...');
    navigate('/login');
  };

  return (
    <Box bg="white" boxShadow="sm" borderBottom="1px" borderColor="gray.200">
      <Container maxW="7xl" py={4}>
        <Flex justify="space-between" align="center">
          <HStack gap={3}>
            <Box
              w="10"
              h="10"
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="lg"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Box>
            <Box>
              <Heading
                size="md"
                bgGradient="linear(to-r, purple.600, blue.600)"
                bgClip="text"
              >
                LeadGrid
              </Heading>
              <Text fontSize="xs" color="gray.500">
                Dashboard
              </Text>
            </Box>
          </HStack>

          <Button
            onClick={handleSignOut}
            variant="ghost"
            colorPalette="gray"
          >
            <Flex align="center" gap={2}>
              <FiLogOut />
              <Text>Sign Out</Text>
            </Flex>
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default DashboardHeader;
