/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
import { Component } from 'react';
import type { ReactNode } from 'react';
import { Box, Heading, Text, Button, Stack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          bg="gray.50"
          p={8}
        >
          <Stack
            gap={6}
            maxW="600px"
            w="full"
            bg="white"
            p={8}
            borderRadius="lg"
            boxShadow="lg"
          >
            <Heading size="lg" color="red.600">
              Oops! Something went wrong
            </Heading>
            
            <Text color="gray.600" textAlign="center">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </Text>

            {import.meta.env.DEV && this.state.error && (
              <Box
                w="full"
                p={4}
                bg="gray.100"
                borderRadius="md"
                fontSize="sm"
                fontFamily="monospace"
                overflow="auto"
                maxH="200px"
              >
                <Text fontWeight="bold" mb={2} color="red.600">
                  Error Details (Development Only):
                </Text>
                <Text color="gray.700">{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text mt={2} color="gray.600" fontSize="xs">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </Box>
            )}

            <Stack gap={3} w="full">
              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                w="full"
                onClick={() => window.location.href = '/'}
              >
                Go to Home
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </Stack>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
