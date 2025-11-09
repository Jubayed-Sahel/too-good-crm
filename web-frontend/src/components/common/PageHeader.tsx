import { Box, Heading, Text, HStack, VStack, Button, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { DESIGN_CONSTANTS } from '@/config/design.constants';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const PageHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  size = 'lg',
}: PageHeaderProps) => {
  const headingSizes = {
    sm: 'lg',
    md: 'xl',
    lg: '2xl',
  };

  return (
    <Box
      mb={DESIGN_CONSTANTS.PAGE_HEADER.MARGIN_BOTTOM}
      pb={DESIGN_CONSTANTS.PAGE_HEADER.PADDING_BOTTOM}
      borderBottom={DESIGN_CONSTANTS.PAGE_HEADER.BORDER_BOTTOM}
      borderColor={DESIGN_CONSTANTS.PAGE_HEADER.BORDER_COLOR}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        gap={DESIGN_CONSTANTS.PAGE_HEADER.GAP}
      >
        <VStack align="start" gap={2} flex={1}>
          {breadcrumbs && <Box>{breadcrumbs}</Box>}
          
          <Heading
            size={headingSizes[size]}
            color={DESIGN_CONSTANTS.TYPOGRAPHY.HEADING.COLOR}
            fontWeight={DESIGN_CONSTANTS.TYPOGRAPHY.HEADING.WEIGHT}
            lineHeight="tight"
          >
            {title}
          </Heading>
          
          {description && (
            <Text
              color={DESIGN_CONSTANTS.TYPOGRAPHY.BODY.COLOR}
              fontSize={DESIGN_CONSTANTS.TYPOGRAPHY.BODY.SIZE}
              maxW={{ base: 'full', md: '2xl' }}
            >
              {description}
            </Text>
          )}
        </VStack>

        {actions && (
          <HStack gap={3} flexShrink={0}>
            {actions}
          </HStack>
        )}
      </Flex>
    </Box>
  );
};

export default PageHeader;

