import { Box, Heading, Text, Flex, VStack, HStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrendingUp } from 'react-icons/fi';

const WelcomeBanner = () => {
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  const handleNewDeal = () => {
    navigate('/deals', { state: { openNewDeal: true } });
  };

  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      borderRadius="2xl"
      boxShadow="lg"
      p={{ base: 5, md: 6 }}
      color="white"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative Background Elements */}
      <Box
        position="absolute"
        top="-50px"
        right="-50px"
        w="200px"
        h="200px"
        bg="whiteAlpha.100"
        borderRadius="full"
        filter="blur(40px)"
      />
      <Box
        position="absolute"
        bottom="-30px"
        left="-30px"
        w="150px"
        h="150px"
        bg="whiteAlpha.100"
        borderRadius="full"
        filter="blur(30px)"
      />

      <Flex 
        justify="space-between" 
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        position="relative"
        zIndex={1}
      >
        <VStack align="start" gap={2}>
          <Text fontSize="md" opacity={0.9} fontWeight="medium">
            {greeting}! 👋
          </Text>
          <Heading size={{ base: 'xl', md: '2xl' }} fontWeight="bold">
            Welcome to Your Dashboard
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} opacity={0.95} maxW="600px">
            Track your sales pipeline, manage customer relationships, and grow your business
          </Text>
        </VStack>

        <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
          <Button
            colorPalette="whiteAlpha"
            variant="outline"
            size="md"
            color="white"
            _hover={{
              bg: 'whiteAlpha.200',
            }}
            borderWidth="2px"
            onClick={handleViewAnalytics}
          >
            <FiTrendingUp />
            <Text ml={2}>View Analytics</Text>
          </Button>
          <Button
            bg="white"
            color="purple.600"
            size="md"
            _hover={{
              bg: 'whiteAlpha.900',
              transform: 'translateY(-2px)',
              boxShadow: 'xl',
            }}
            transition="all 0.2s"
            fontWeight="semibold"
            onClick={handleNewDeal}
          >
            <FiPlus />
            <Text ml={2}>New Deal</Text>
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default WelcomeBanner;
