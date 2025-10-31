import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';

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
      display={{ base: 'block', md: 'none' }}
    >
      <Flex align="center" px={4} py={3} gap={3}>
        <IconButton
          aria-label="Open menu"
          onClick={onMenuClick}
          variant="ghost"
          size="md"
        >
          <FiMenu />
        </IconButton>
        <Text fontWeight="semibold" fontSize="lg">
          {title}
        </Text>
      </Flex>
    </Box>
  );
};

export default TopBar;
