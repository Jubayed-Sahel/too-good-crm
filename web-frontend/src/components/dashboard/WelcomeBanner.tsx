import { Box, Heading, Text, Flex } from '@chakra-ui/react';

const WelcomeBanner = () => {
  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      borderRadius="2xl"
      boxShadow="xl"
      p={{ base: 6, md: 8 }}
      color="white"
    >
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size={{ base: 'lg', md: 'xl' }} mb={2}>
            Welcome to Your Dashboard! 🎉
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} opacity={0.9}>
            You've successfully logged in. Your CRM journey starts here.
          </Text>
        </Box>
        <Box display={{ base: 'none', md: 'block' }}>
          <svg className="w-24 h-24 opacity-20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </Box>
      </Flex>
    </Box>
  );
};

export default WelcomeBanner;
