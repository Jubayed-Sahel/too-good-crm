import { Box, Flex, IconButton, Text, HStack } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { ModeSwitcher } from '../common';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

const TopBar = ({ onMenuClick, title = 'Dashboard' }: TopBarProps) => {
  return (
    <Box
      position="sticky"
      top={0}
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      zIndex={10}
      width="100%"
      overflowX="hidden"
    >
      <Flex 
        align="center" 
        justify="space-between" 
        px={{ base: 3, md: 4 }} 
        py={3} 
        gap={{ base: 2, md: 3 }}
        maxW="100%"
      >
        {/* Left: Menu & Title */}
        <HStack gap={{ base: 2, md: 3 }} minW={0} flex={1}>
          <IconButton
            aria-label="Open menu"
            onClick={onMenuClick}
            variant="ghost"
            size="md"
            display={{ base: 'flex', md: 'none' }}
            flexShrink={0}
          >
            <FiMenu />
          </IconButton>
          <Text 
            fontWeight="semibold" 
            fontSize={{ base: 'md', md: 'lg' }}
            display={{ base: 'block', md: 'none' }}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {title}
          </Text>
        </HStack>

        {/* Right: Mode Switcher */}
        <ModeSwitcher />
      </Flex>
    </Box>
  );
};

export default TopBar;
