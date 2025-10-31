import { Box, Flex, Heading, Icon } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  children: ReactNode;
}

const InfoCard = ({ title, icon, iconBg, iconColor, children }: InfoCardProps) => {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="md"
      p={{ base: 4, md: 6 }}
      border="1px"
      borderColor="gray.100"
    >
      <Flex align="center" gap={3} mb={4}>
        <Flex
          w={{ base: 8, md: 10 }}
          h={{ base: 8, md: 10 }}
          bg={iconBg}
          borderRadius="lg"
          align="center"
          justify="center"
        >
          <Icon as={() => icon} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} color={iconColor} />
        </Flex>
        <Heading size={{ base: 'sm', md: 'md' }} color="gray.800">
          {title}
        </Heading>
      </Flex>
      <Box color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
        {children}
      </Box>
    </Box>
  );
};

export default InfoCard;
