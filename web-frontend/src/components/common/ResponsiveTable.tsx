import { Box, useBreakpointValue } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  mobileView: ReactNode;
}

/**
 * ResponsiveTable - Switches between table and card view based on screen size
 * @param children - Desktop table view
 * @param mobileView - Mobile card view
 */
export const ResponsiveTable = ({ children, mobileView }: ResponsiveTableProps) => {
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Box>
      {isMobile ? (
        <Box display={{ base: 'block', lg: 'none' }}>
          {mobileView}
        </Box>
      ) : (
        <Box display={{ base: 'none', lg: 'block' }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default ResponsiveTable;
