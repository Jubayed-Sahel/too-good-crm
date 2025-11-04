import { Box, Flex, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut,
  FiUserPlus,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    console.log('Signing out...');
    navigate('/login');
  };

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiUsers, label: 'Customers', path: '/customers' },
    { icon: FiTrendingUp, label: 'Sales', path: '/sales' },
    { icon: FiFileText, label: 'Deals', path: '/deals' },
    { icon: FiUserPlus, label: 'Leads', path: '/leads' },
    { icon: FiActivity, label: 'Activities', path: '/activities' },
    { icon: FiBarChart2, label: 'Analytics', path: '/analytics' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <Box
          display={{ base: 'block', md: 'none' }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={19}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <Box
        position="fixed"
        left={0}
        top={0}
        h="100vh"
        w={{ base: '280px', md: '280px' }}
        bg="white"
        borderRight="1px"
        borderColor="gray.200"
        zIndex={20}
        transform={{
          base: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          md: 'translateX(0)',
        }}
        transition="transform 0.3s"
        overflowY="auto"
      >
        <VStack align="stretch" h="full" gap={0}>
          {/* Logo Section */}
          <Box p={6} borderBottom="1px" borderColor="gray.200">
            <Flex align="center" gap={3}>
              <Box
                w="10"
                h="10"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="md"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Box>
              <Box>
                <Heading
                  size="md"
                  bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  LeadGrid
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  CRM Platform
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Navigation Menu */}
          <VStack align="stretch" flex={1} p={4} gap={1}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ textDecoration: 'none' }}
              >
                {({ isActive }) => (
                  <Flex
                    align="center"
                    gap={3}
                    px={4}
                    py={3}
                    borderRadius="lg"
                    bg={isActive ? 'purple.50' : 'transparent'}
                    color={isActive ? 'purple.600' : 'gray.700'}
                    fontWeight={isActive ? 'semibold' : 'medium'}
                    _hover={{
                      bg: isActive ? 'purple.50' : 'gray.50',
                      color: isActive ? 'purple.600' : 'gray.900',
                    }}
                    cursor="pointer"
                    transition="all 0.2s"
                  >
                    <Box as={item.icon} fontSize="lg" />
                    <Text>{item.label}</Text>
                  </Flex>
                )}
              </NavLink>
            ))}
          </VStack>

          {/* Sign Out Button */}
          <Box p={4} borderTop="1px" borderColor="gray.200">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              w="full"
              justifyContent="flex-start"
              px={4}
              color="red.600"
              _hover={{ bg: 'red.50' }}
            >
              <Flex align="center" gap={3}>
                <FiLogOut />
                <Text>Sign Out</Text>
              </Flex>
            </Button>
          </Box>
        </VStack>
      </Box>
    </>
  );
};

export default Sidebar;
