import { Box, Container } from '@chakra-ui/react';
import type { ContainerProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface PageContainerProps extends ContainerProps {
  children: ReactNode;
  withPadding?: boolean;
}

const PageContainer = ({ children, withPadding = true, ...props }: PageContainerProps) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Container
        maxW="7xl"
        py={withPadding ? { base: 4, md: 8 } : 0}
        px={{ base: 4, md: 6, lg: 8 }}
        {...props}
      >
        {children}
      </Container>
    </Box>
  );
};

export default PageContainer;
