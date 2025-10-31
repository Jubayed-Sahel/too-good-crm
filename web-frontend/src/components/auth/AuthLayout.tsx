import { Box, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Box minH="100vh" maxH="100vh" bg="gray.50" overflow="hidden" className="auth-page">
      <Flex
        direction={{ base: 'column', md: 'row' }}
        h="100vh"
      >
        {/* Left Side - Branding */}
        <Flex
          flex="1"
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          color="white"
          p={12}
          display={{ base: 'none', md: 'flex' }}
          align="center"
          justify="center"
        >
          <VStack gap={6} maxW="md">
            <Box
              w="16"
              h="16"
              bg="whiteAlpha.200"
              borderRadius="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="lg"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Box>
            <Heading size="2xl" textAlign="center">
              LeadGrid
            </Heading>
            <Text fontSize="lg" textAlign="center" opacity={0.9}>
              Your modern CRM solution for managing customer relationships and driving growth
            </Text>
          </VStack>
        </Flex>

        {/* Right Side - Form */}
        <Flex
          flex="1"
          align="center"
          justify="center"
          p={{ base: 6, md: 8 }}
          overflowY="auto"
          maxH="100vh"
        >
          <Container maxW="md" w="full">
            {children}
          </Container>
        </Flex>
      </Flex>
    </Box>
  );
};

export default AuthLayout;
