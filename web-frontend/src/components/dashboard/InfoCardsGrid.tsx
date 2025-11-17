import { SimpleGrid, Text, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import InfoCard from './InfoCard';
import { FiUsers, FiFileText, FiUserPlus, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { usePermissions } from '@/contexts/PermissionContext';
import { usePermissionActions } from '@/hooks/usePermissionActions';

const InfoCardsGrid = () => {
  const navigate = useNavigate();
  const { canAccess } = usePermissions();
  const dealsPermissions = usePermissionActions('deals');
  const leadsPermissions = usePermissionActions('leads');
  const customersPermissions = usePermissionActions('customers');

  const quickAccessCards = [];

  // Customers card - only if employee has access
  if (canAccess('customers')) {
    quickAccessCards.push({
      title: 'Customers',
      icon: <FiUsers />,
      iconBg: 'purple.100',
      iconColor: 'purple.600',
      description: customersPermissions.canCreate 
        ? 'Manage your customer relationships and create new customer records.'
        : 'View your customer information and relationships.',
      actionLabel: customersPermissions.canCreate ? 'Create Customer' : 'View Customers',
      actionPath: '/customers',
      canCreate: customersPermissions.canCreate,
    });
  }

  // Deals card - only if employee has access
  if (canAccess('deals')) {
    quickAccessCards.push({
      title: 'Deals',
      icon: <FiFileText />,
      iconBg: 'blue.100',
      iconColor: 'blue.600',
      description: dealsPermissions.canCreate
        ? 'Track your sales pipeline and create new deals.'
        : 'View your active deals and sales pipeline.',
      actionLabel: dealsPermissions.canCreate ? 'Create Deal' : 'View Deals',
      actionPath: '/deals',
      canCreate: dealsPermissions.canCreate,
    });
  }

  // Leads card - only if employee has access
  if (canAccess('leads')) {
    quickAccessCards.push({
      title: 'Leads',
      icon: <FiUserPlus />,
      iconBg: 'green.100',
      iconColor: 'green.600',
      description: leadsPermissions.canCreate
        ? 'Manage your leads and convert them into customers.'
        : 'View and track your leads.',
      actionLabel: leadsPermissions.canCreate ? 'Create Lead' : 'View Leads',
      actionPath: '/leads',
      canCreate: leadsPermissions.canCreate,
    });
  }

  // Analytics card - only if employee has access
  if (canAccess('analytics')) {
    quickAccessCards.push({
      title: 'Analytics',
      icon: <FiTrendingUp />,
      iconBg: 'orange.100',
      iconColor: 'orange.600',
      description: 'View performance metrics and insights.',
      actionLabel: 'View Analytics',
      actionPath: '/analytics',
      canCreate: false,
    });
  }

  // Activities card - only if employee has access
  if (canAccess('activities')) {
    quickAccessCards.push({
      title: 'Activities',
      icon: <FiActivity />,
      iconBg: 'teal.100',
      iconColor: 'teal.600',
      description: 'Track your activities and interactions.',
      actionLabel: 'View Activities',
      actionPath: '/activities',
      canCreate: false,
    });
  }

  // If no cards to show, return null
  if (quickAccessCards.length === 0) {
    return null;
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
      {quickAccessCards.map((card, index) => (
        <InfoCard
          key={index}
          title={card.title}
          icon={card.icon}
          iconBg={card.iconBg}
          iconColor={card.iconColor}
        >
          <VStack align="stretch" gap={4}>
            <Text fontSize="md">
              {card.description}
            </Text>
            <Button
              colorPalette={card.canCreate ? 'purple' : 'gray'}
              variant={card.canCreate ? 'solid' : 'outline'}
              onClick={() => navigate(card.actionPath)}
              size="sm"
              width="fit-content"
            >
              {card.actionLabel}
            </Button>
          </VStack>
        </InfoCard>
      ))}
    </SimpleGrid>
  );
};

export default InfoCardsGrid;
