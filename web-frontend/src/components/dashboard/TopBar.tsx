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
    >
      <Flex align="center" justify="space-between" px={4} py={3} gap={3}>
        {/* Left: Menu & Title */}
        <HStack gap={3}>
          <IconButton
            aria-label="Open menu"
            onClick={onMenuClick}
            variant="ghost"
            size="md"
            display={{ base: 'flex', md: 'none' }}
          >
            <FiMenu />
          </IconButton>
          <Text fontWeight="semibold" fontSize="lg" display={{ base: 'block', md: 'none' }}>
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
