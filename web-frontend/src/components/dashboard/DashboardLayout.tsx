import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useState, useCallback, memo } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <Box minH="100vh" bg="gray.50" overflowX="hidden" width="100%">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      {/* Main Content Area */}
      <Box ml={{ base: 0, md: '280px' }} minH="100vh" width={{ base: '100%', md: 'calc(100% - 280px)' }} overflowX="hidden">
        {/* Mobile Top Bar */}
        <TopBar onMenuClick={handleMenuClick} title={title} />

        {/* Page Content */}
        <Box 
          px={{ base: 4, md: 5, lg: 6 }} 
          py={{ base: 4, md: 5 }}
          pt={{ base: '68px', md: 5 }}
          maxW="100%" 
          width="100%"
        >
          <Box 
            bg="transparent"
            minH="calc(100vh - 150px)"
            maxW="1600px"
            mx="auto"
            width="100%"
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(DashboardLayout);
