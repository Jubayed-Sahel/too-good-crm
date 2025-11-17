/**
 * Employee Welcome Banner
 * Tailored welcome message for employees with permission-aware actions
 */
import { Box, Heading, Text, Flex, VStack, HStack, Button, Badge } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrendingUp, FiUsers, FiFileText, FiUserPlus, FiBriefcase } from 'react-icons/fi';
import { usePermissions } from '@/contexts/PermissionContext';
import { usePermissionActions } from '@/hooks/usePermissionActions';
import { useProfile } from '@/contexts/ProfileContext';

// CSS keyframes as strings
const gradientShiftKeyframes = `
  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject keyframes into document
if (typeof document !== 'undefined') {
  const styleId = 'employee-welcome-banner-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = gradientShiftKeyframes + fadeInUpKeyframes;
    document.head.appendChild(style);
  }
}

export const EmployeeWelcomeBanner = () => {
  const navigate = useNavigate();
  const { canAccess } = usePermissions();
  const { activeProfile } = useProfile();
  const dealsPermissions = usePermissionActions('deals');
  const leadsPermissions = usePermissionActions('leads');
  const customersPermissions = usePermissionActions('customers');
  
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  
  // Get organization name from active profile
  const organizationName = activeProfile?.organization_name || 'Your Organization';

  const quickActions = [
    {
      label: 'New Deal',
      icon: FiFileText,
      path: '/employee/deals',
      visible: dealsPermissions.canCreate,
      color: 'white',
    },
    {
      label: 'New Lead',
      icon: FiUserPlus,
      path: '/employee/leads',
      visible: leadsPermissions.canCreate,
      color: 'white',
    },
    {
      label: 'New Customer',
      icon: FiUsers,
      path: '/employee/customers',
      visible: customersPermissions.canCreate,
      color: 'white',
    },
    {
      label: 'Analytics',
      icon: FiTrendingUp,
      path: '/analytics',
      visible: canAccess('analytics'),
      color: 'whiteAlpha',
    },
  ].filter(action => action.visible);

  return (
    <Box
      background="linear-gradient(-45deg, #3b82f6, #2563eb, #3b82f6, #2563eb)"
      backgroundSize="400% 400%"
      animation="gradientShift 15s ease infinite, fadeInUp 0.8s ease-out"
      borderRadius="2xl"
      boxShadow="2xl"
      p={{ base: 5, md: 6 }}
      color="white"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative Background Elements */}
      <Box
        position="absolute"
        top="-50px"
        right="-50px"
        w="200px"
        h="200px"
        bg="whiteAlpha.100"
        borderRadius="full"
        filter="blur(40px)"
      />
      <Box
        position="absolute"
        bottom="-30px"
        left="-30px"
        w="150px"
        h="150px"
        bg="whiteAlpha.100"
        borderRadius="full"
        filter="blur(30px)"
      />

      <Flex 
        justify="space-between" 
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        position="relative"
        zIndex={1}
      >
        <VStack align="start" gap={2} flex={1} width={{ base: 'full', md: 'auto' }}>
          <Text fontSize="md" opacity={0.9} fontWeight="medium">
            {greeting}! 👋
          </Text>
          <Heading size={{ base: 'xl', md: '2xl' }} fontWeight="bold">
            Welcome to Your Workspace
          </Heading>
          {/* Organization/Vendor Name Display */}
          {organizationName && (
            <HStack gap={2} mt={1}>
              <Box color="whiteAlpha.800">
                <FiBriefcase size={18} />
              </Box>
              <Badge 
                colorPalette="whiteAlpha" 
                variant="solid"
                px={3}
                py={1}
                borderRadius="md"
                fontSize="sm"
                fontWeight="semibold"
              >
                {organizationName}
              </Badge>
            </HStack>
          )}
          <Text fontSize={{ base: 'md', md: 'lg' }} opacity={0.95} maxW="600px" mt={organizationName ? 1 : 0}>
            Manage your assigned work, track your progress, and collaborate with your team
          </Text>
        </VStack>

        {quickActions.length > 0 && (
          <HStack gap={3} width={{ base: 'full', md: 'auto' }} flexWrap="wrap">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                colorPalette={action.color === 'white' ? 'whiteAlpha' : 'whiteAlpha'}
                variant={action.color === 'white' ? 'solid' : 'outline'}
                size={{ base: 'sm', md: 'md' }}
                color={action.color === 'white' ? 'blue.600' : 'white'}
                bg={action.color === 'white' ? 'white' : 'transparent'}
                _hover={{
                  bg: action.color === 'white' ? 'whiteAlpha.900' : 'whiteAlpha.200',
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl',
                }}
                borderWidth={action.color === 'whiteAlpha' ? '2px' : '0'}
                onClick={() => navigate(action.path)}
                transition="all 0.2s"
                fontWeight="semibold"
                flex={{ base: quickActions.length <= 2 ? 1 : 'initial', md: 'initial' }}
              >
                <action.icon />
                <Text ml={2}>{action.label}</Text>
              </Button>
            ))}
          </HStack>
        )}
      </Flex>
    </Box>
  );
};

