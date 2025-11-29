import { SimpleGrid, Text, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import InfoCard from './InfoCard';
import { FiUsers, FiTrendingUp, FiActivity, FiMessageCircle, FiExternalLink } from 'react-icons/fi';
import { usePermissions } from '@/contexts/PermissionContext';
import { usePermissionActions } from '@/hooks/usePermissionActions';

const InfoCardsGrid = () => {
  const navigate = useNavigate();
  const { canAccess } = usePermissions();
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

  // Telegram Bot card - always show for all users
  quickAccessCards.push({
    title: 'Telegram Bot',
    icon: <FiMessageCircle />,
    iconBg: 'blue.100',
    iconColor: 'blue.600',
    description: 'Connect with LeadGrid Bot on Telegram for quick access to your CRM, receive notifications, and manage your leads and deals on the go.',
    actionLabel: 'Open LeadGrid Bot',
    actionPath: 'https://t.me/LeadGrid_bot',
    canCreate: false,
    isExternal: true,
  });

  // Always show at least the Telegram Bot card
  // (This check is now redundant since we always add the Telegram Bot card, but kept for safety)
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
              colorPalette={card.canCreate ? 'purple' : card.isExternal ? 'blue' : 'gray'}
              variant={card.canCreate ? 'solid' : 'outline'}
              onClick={() => {
                if (card.isExternal) {
                  window.open(card.actionPath, '_blank');
                } else {
                  navigate(card.actionPath);
                }
              }}
              size="sm"
              width="fit-content"
              leftIcon={card.isExternal ? <FiExternalLink /> : undefined}
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
