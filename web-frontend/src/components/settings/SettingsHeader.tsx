import { Box, Heading, Text, HStack } from '@chakra-ui/react';

const SettingsHeader = () => {
  return (
    <Box>
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="xl" mb={2}>
            Settings
          </Heading>
          <Text color="gray.600">
            Manage your account and organization preferences
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default SettingsHeader;
