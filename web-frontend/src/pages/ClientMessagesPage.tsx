import { Box } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { VoiceGeminiChatWindow } from '@/components/messages/VoiceGeminiChatWindow';

const ClientMessagesPage = () => {
  return (
    <DashboardLayout title="AI Assistant">
      <Box h="calc(100vh - 80px)" minH="600px">
        <VoiceGeminiChatWindow autoSpeak={true} defaultLanguage="en-US" />
      </Box>
    </DashboardLayout>
  );
};

export default ClientMessagesPage;
