import { Box, Heading, Text, VStack, HStack, Button } from '@chakra-ui/react';
import { FiPhone, FiMail, FiMessageCircle, FiX } from 'react-icons/fi';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
} from '../ui/dialog';

interface ActivityTypeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCall: () => void;
  onSelectEmail: () => void;
  onSelectTelegram: () => void;
  isClientMode?: boolean;
}

export const ActivityTypeMenu = ({ 
  isOpen, 
  onClose, 
  onSelectCall, 
  onSelectEmail, 
  onSelectTelegram,
  isClientMode = false,
}: ActivityTypeMenuProps) => {
  const primaryColor = isClientMode ? 'blue' : 'purple';
  
  return (
    <DialogRoot open={isOpen} onOpenChange={(e: any) => !e.open && onClose()}>
      <DialogContent maxW="400px">
        <DialogHeader>
          <Heading size="lg" color="gray.900">
            Create New Activity
          </Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            Choose the type of activity you want to create
          </Text>
          <DialogCloseTrigger>
            <FiX />
          </DialogCloseTrigger>
        </DialogHeader>

        <DialogBody>
          <VStack align="stretch" gap={3}>
            {/* Call Option */}
            <Box
              p={4}
              bg={`${primaryColor}.50`}
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: `${primaryColor}.100` }}
              onClick={() => {
                onSelectCall();
                onClose();
              }}
              transition="all 0.2s"
            >
              <HStack gap={3}>
                <Box
                  p={3}
                  bg={`${primaryColor}.100`}
                  borderRadius="md"
                  color={`${primaryColor}.600`}
                >
                  <FiPhone size={24} />
                </Box>
                <Box flex="1">
                  <Text fontSize="md" fontWeight="semibold" color="gray.900" mb={1}>
                    Log a Call
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Record details of a phone conversation
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Telegram Option */}
            <Box
              p={4}
              bg="cyan.50"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: 'cyan.100' }}
              onClick={() => {
                onSelectTelegram();
                onClose();
              }}
              transition="all 0.2s"
            >
              <HStack gap={3}>
                <Box
                  p={3}
                  bg="cyan.100"
                  borderRadius="md"
                  color="cyan.600"
                >
                  <FiMessageCircle size={24} />
                </Box>
                <Box flex="1">
                  <Text fontSize="md" fontWeight="semibold" color="gray.900" mb={1}>
                    Send Telegram Message
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Send a message via Telegram
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Cancel Button */}
            <Button
              variant="outline"
              onClick={onClose}
              mt={2}
            >
              Cancel
            </Button>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};
