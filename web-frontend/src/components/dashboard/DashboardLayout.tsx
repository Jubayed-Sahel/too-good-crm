import { Box, Container } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <Box ml={{ base: 0, md: '280px' }} minH="100vh">
        {/* Mobile Top Bar */}
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} title={title} />

        {/* Page Content */}
        <Container maxW="7xl" py={{ base: 6, md: 8 }}>
          <Box 
            bg="transparent"
            minH="calc(100vh - 200px)"
          >
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
