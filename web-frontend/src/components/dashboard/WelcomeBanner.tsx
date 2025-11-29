import { Box, Heading, Text, Flex, VStack, HStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrendingUp } from 'react-icons/fi';

// CSS keyframes as strings
const gradientShiftKeyframes = `
  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject keyframes into document
if (typeof document !== 'undefined') {
  const styleId = 'welcome-banner-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = gradientShiftKeyframes + fadeInUpKeyframes;
    document.head.appendChild(style);
  }
}

const WelcomeBanner = () => {
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const handleNewDeal = () => {
    navigate('/deals', { state: { openNewDeal: true } });
  };

  return (
    <Box
      background="linear-gradient(-45deg, #667eea, #764ba2, #667eea, #764ba2)"
      backgroundSize="400% 400%"
      animation="gradientShift 15s ease infinite, fadeInUp 0.8s ease-out"
      borderRadius="2xl"
      boxShadow="2xl"
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
        <VStack align="start" gap={2} flex={1} width={{ base: 'full', md: 'auto' }}>
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

        <HStack gap={3} width={{ base: 'full', md: 'auto' }}>
          <Button
            bg="white"
            color="purple.600"
            size={{ base: 'sm', md: 'md' }}
            _hover={{
              bg: 'whiteAlpha.900',
              transform: 'translateY(-2px)',
              boxShadow: 'xl',
            }}
            transition="all 0.2s"
            fontWeight="semibold"
            onClick={handleNewDeal}
            flex={{ base: 1, md: 'initial' }}
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
