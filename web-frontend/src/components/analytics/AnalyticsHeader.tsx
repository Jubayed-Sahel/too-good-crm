import { Box, Heading, Text, HStack, Button } from '@chakra-ui/react';
import { FiDownload, FiCalendar } from 'react-icons/fi';

interface AnalyticsHeaderProps {
  onExport?: () => void;
  onDateRangeChange?: () => void;
}

const AnalyticsHeader = ({ onExport, onDateRangeChange }: AnalyticsHeaderProps) => {
  return (
    <Box>
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="xl" mb={2}>
            Analytics
          </Heading>
          <Text color="gray.600">
            Track your sales performance and business insights
          </Text>
        </Box>
        <HStack gap={2} flexWrap="wrap">
          <Button
            variant="outline"
            size="md"
            onClick={onDateRangeChange}
          >
            <FiCalendar />
            <Box ml={2}>Last 30 Days</Box>
          </Button>
          <Button
            colorPalette="blue"
            size="md"
            onClick={onExport}
          >
            <FiDownload />
            <Box ml={2}>Export Report</Box>
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default AnalyticsHeader;
