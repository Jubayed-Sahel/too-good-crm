import { Box, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { DESIGN_CONSTANTS } from '@/config/design.constants';

interface PageContainerProps {
  children: ReactNode;
  gap?: number;
  maxWidth?: string;
  padding?: {
    x?: number | object;
    y?: number | object;
  };
}

export const PageContainer = ({
  children,
  gap = DESIGN_CONSTANTS.PAGE.GAP,
  maxWidth = DESIGN_CONSTANTS.PAGE.MAX_WIDTH,
  padding,
}: PageContainerProps) => {
  return (
    <Box
      w="100%"
      maxW={maxWidth}
      mx="auto"
    >
      <VStack
        align="stretch"
        gap={gap}
        px={padding?.x || DESIGN_CONSTANTS.PAGE.PADDING_X}
        py={padding?.y || DESIGN_CONSTANTS.PAGE.PADDING_Y}
      >
        {children}
      </VStack>
    </Box>
  );
};

export default PageContainer;
