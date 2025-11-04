import { Box, Heading, Text, VStack, HStack, Button, Separator } from '@chakra-ui/react';
import { FiMail, FiPhone, FiMapPin, FiX } from 'react-icons/fi';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from '../ui/dialog';

interface VendorContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    category?: string;
  };
}

export const VendorContactDialog = ({ isOpen, onClose, vendor }: VendorContactDialogProps) => {
  const handleEmailClick = () => {
    window.location.href = `mailto:${vendor.email}`;
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${vendor.phone}`;
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e: any) => !e.open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <Heading size="lg" color="gray.900">
            Contact {vendor.name}
          </Heading>
          {vendor.category && (
            <Text fontSize="sm" color="gray.600" mt={1}>
              {vendor.category}
            </Text>
          )}
          <DialogCloseTrigger>
            <FiX />
          </DialogCloseTrigger>
        </DialogHeader>

        <DialogBody>
          <VStack align="stretch" gap={4}>
            <Text fontSize="md" color="gray.700">
              Choose how you'd like to get in touch with this vendor:
            </Text>

            <Separator />

            {/* Email Contact */}
            <Box
              p={4}
              bg="blue.50"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: 'blue.100' }}
              onClick={handleEmailClick}
            >
              <HStack gap={3}>
                <Box color="blue.600">
                  <FiMail size={24} />
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" color="blue.700" fontWeight="semibold" mb={1}>
                    Email
                  </Text>
                  <Text fontSize="md" color="blue.900" fontWeight="medium">
                    {vendor.email}
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Phone Contact */}
            <Box
              p={4}
              bg="green.50"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: 'green.100' }}
              onClick={handlePhoneClick}
            >
              <HStack gap={3}>
                <Box color="green.600">
                  <FiPhone size={24} />
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" color="green.700" fontWeight="semibold" mb={1}>
                    Phone
                  </Text>
                  <Text fontSize="md" color="green.900" fontWeight="medium">
                    {vendor.phone}
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Address (if available) */}
            {vendor.address && (
              <Box p={4} bg="purple.50" borderRadius="lg">
                <HStack gap={3} align="start">
                  <Box color="purple.600">
                    <FiMapPin size={24} />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color="purple.700" fontWeight="semibold" mb={1}>
                      Address
                    </Text>
                    <Text fontSize="md" color="purple.900" fontWeight="medium">
                      {vendor.address}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            )}
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
