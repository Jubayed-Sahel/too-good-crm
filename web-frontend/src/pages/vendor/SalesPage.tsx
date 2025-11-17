import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Grid, 
  Badge, 
  Button,
  Input,
  Stack,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTarget, 
  FiAward, 
  FiUser, 
  FiCalendar,
  FiPlus,
  FiFilter,
  FiSearch,
} from 'react-icons/fi';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CustomSelect from '../../components/ui/CustomSelect';
import { useSalesPage } from '@/hooks/useSalesPage';
import { useLeads } from '@/hooks';
import { useMoveDealToStage } from '@/hooks/useDealMutations';
import { useConvertLead } from '@/hooks/useLeadMutations';
import { toaster } from '@/components/ui/toaster';
import type { Deal } from '@/types';
import type { Lead } from '@/types/lead.types';

// Sortable Deal Card Component
interface SortableDealCardProps {
  deal: Deal;
  stageColor: string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  onClick?: () => void;
}

function SortableDealCard({ deal, stageColor, formatCurrency, formatDate, onClick }: SortableDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `deal-${deal.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dealValue = typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      bg="white"
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
      _hover={{
        boxShadow: 'md',
        borderColor: `${stageColor}.400`,
        transform: 'translateY(-2px)',
      }}
      transition="all 0.2s ease"
      cursor="grab"
      position="relative"
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <VStack align="stretch" gap={3}>
        {/* Deal Title */}
        <Text
          fontWeight="semibold"
          fontSize="sm"
          color="gray.900"
          lineHeight="1.4"
          css={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {deal.title}
        </Text>

        {/* Customer */}
        <HStack
          gap={2}
          p={2}
          bg="gray.50"
          borderRadius="md"
        >
          <Box
            p={1.5}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <FiUser size={14} color="var(--gray-600)" />
          </Box>
          <Text fontSize="xs" color="gray.700" fontWeight="medium" flex={1}>
            {deal.customer_name || 'No Customer'}
          </Text>
        </HStack>

        {/* Value & Probability Row */}
        <HStack justify="space-between" gap={2}>
          <VStack align="start" gap={0} flex={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              Value
            </Text>
            <Text fontSize="lg" fontWeight="bold" color={`${stageColor}.600`}>
              {formatCurrency(dealValue)}
            </Text>
          </VStack>
          {deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && (
            <VStack align="end" gap={0}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                Probability
              </Text>
              <Badge 
                colorPalette={
                  deal.probability >= 70 ? 'green' : 
                  deal.probability >= 40 ? 'orange' : 'gray'
                }
                size="sm"
                variant="subtle"
                px={2}
                py={0.5}
              >
                {deal.probability}%
              </Badge>
            </VStack>
          )}
        </HStack>

        {/* Footer Info */}
        <VStack align="stretch" gap={1.5} pt={2} borderTop="1px" borderColor="gray.100">
          <HStack gap={1.5} fontSize="xs" color="gray.500">
            <FiCalendar size={14} />
            <Text>
              {deal.actual_close_date 
                ? `Closed ${formatDate(deal.actual_close_date)}`
                : deal.expected_close_date 
                  ? formatDate(deal.expected_close_date)
                  : 'No date'
              }
            </Text>
          </HStack>
          {deal.assigned_to_name && (
            <HStack gap={1.5} fontSize="xs" color="gray.500">
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg={`${stageColor}.500`}
              />
              <Text>{deal.assigned_to_name}</Text>
            </HStack>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}

// Sortable Lead Card Component
interface SortableLeadCardProps {
  lead: Lead;
  stageColor: string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  onClick?: () => void;
}

function SortableLeadCard({ lead, stageColor, formatCurrency, formatDate, onClick }: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `lead-${lead.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const estimatedValue = typeof lead.estimated_value === 'string' 
    ? parseFloat(lead.estimated_value) 
    : lead.estimated_value || 0;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      bg="white"
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="blue.200"
      boxShadow="sm"
      _hover={{
        boxShadow: 'md',
        borderColor: 'blue.400',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.2s ease"
      cursor="grab"
      position="relative"
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <VStack align="stretch" gap={3}>
        <Badge colorPalette="blue" size="sm" w="fit-content">
          Lead
        </Badge>
        
        {/* Lead Name */}
        <Text
          fontWeight="semibold"
          fontSize="sm"
          color="gray.900"
          lineHeight="1.4"
        >
          {lead.name || lead.organization_name || 'Unnamed Lead'}
        </Text>

        {/* Contact Info */}
        <HStack
          gap={2}
          p={2}
          bg="gray.50"
          borderRadius="md"
        >
          <Box
            p={1.5}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <FiUser size={14} color="var(--gray-600)" />
          </Box>
          <Text fontSize="xs" color="gray.700" fontWeight="medium" flex={1}>
            {lead.email || lead.phone || 'No contact'}
          </Text>
        </HStack>

        {/* Estimated Value */}
        {estimatedValue > 0 && (
          <HStack justify="space-between" gap={2}>
            <VStack align="start" gap={0} flex={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                Estimated Value
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                {formatCurrency(estimatedValue)}
              </Text>
            </VStack>
          </HStack>
        )}

        {/* Footer Info */}
        <VStack align="stretch" gap={1.5} pt={2} borderTop="1px" borderColor="gray.100">
          <HStack gap={1.5} fontSize="xs" color="gray.500">
            <FiCalendar size={14} />
            <Text>
              {lead.created_at ? formatDate(lead.created_at) : 'No date'}
            </Text>
          </HStack>
          {lead.assigned_to_name && (
            <HStack gap={1.5} fontSize="xs" color="gray.500">
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg="blue.500"
              />
              <Text>{lead.assigned_to_name}</Text>
            </HStack>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}

// Stage Column Component
interface StageColumnProps {
  stage: { id?: number; name: string; key: string; color: string; icon: any };
  deals: Deal[];
  leads: Lead[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  onDealClick?: (deal: Deal) => void;
  onLeadClick?: (lead: Lead) => void;
}

function StageColumn({ stage, deals, leads, formatCurrency, formatDate, onDealClick, onLeadClick }: StageColumnProps) {
  // Use stage key as droppable ID
  const stageDroppableId = stage.key;
  const { setNodeRef } = useDroppable({
    id: stageDroppableId,
  });
  const StageIcon = stage.icon;
  const allItems = [
    ...deals.map(d => ({ type: 'deal' as const, id: `deal-${d.id}`, data: d })),
    ...leads.map(l => ({ type: 'lead' as const, id: `lead-${l.id}`, data: l })),
  ];

  const stageValue = deals.reduce((sum, deal) => {
    const value = typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;
    return sum + (value || 0);
  }, 0);

  return (
    <VStack
      ref={setNodeRef}
      id={stageDroppableId}
      data-stage-id={stage.id}
      data-stage-key={stage.key}
      align="stretch"
      bg="white"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.200"
      w={{ base: '320px', md: '300px' }}
      minH="600px"
      maxH="calc(100vh - 450px)"
      flexShrink={0}
      boxShadow="sm"
    >
      {/* Stage Header */}
      <Box
        p={4}
        borderBottom="2px solid"
        borderColor={`${stage.color}.200`}
        bg={`${stage.color}.50`}
        borderTopRadius="xl"
      >
        <HStack justify="space-between" mb={2}>
          <HStack gap={2}>
            <Box
              as={StageIcon}
              fontSize="md"
              color={`${stage.color}.600`}
            />
            <Text fontWeight="bold" fontSize="sm" color="gray.900">
              {stage.label || stage.name}
            </Text>
          </HStack>
          <Badge 
            colorPalette={stage.color} 
            size="sm"
            variant="solid"
            px={2}
            py={0.5}
          >
            {allItems.length}
          </Badge>
        </HStack>
        <Text fontSize="xs" fontWeight="semibold" color={`${stage.color}.700`}>
          {formatCurrency(stageValue)}
        </Text>
      </Box>

      {/* Scrollable Items Container */}
      <SortableContext items={allItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <VStack
          align="stretch"
          gap={3}
          p={3}
          flex={1}
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#CBD5E0',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#A0AEC0',
            },
          }}
        >
          {allItems.length === 0 ? (
            <Box
              textAlign="center"
              py={12}
              px={4}
              borderWidth="2px"
              borderStyle="dashed"
              borderColor="gray.200"
              borderRadius="lg"
              bg="gray.50"
            >
              <Text fontSize="sm" color="gray.400" fontWeight="medium">
                No items
              </Text>
            </Box>
          ) : (
            allItems.map((item) => {
              if (item.type === 'deal') {
                return (
                  <SortableDealCard
                    key={item.id}
                    deal={item.data as Deal}
                    stageColor={stage.color}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    onClick={() => onDealClick?.(item.data as Deal)}
                  />
                );
              } else {
                return (
                  <SortableLeadCard
                    key={item.id}
                    lead={item.data as Lead}
                    stageColor={stage.color}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    onClick={() => onLeadClick?.(item.data as Lead)}
                  />
                );
              }
            })
          )}
        </VStack>
      </SortableContext>
    </VStack>
  );
}

const SalesPage = () => {
  const navigate = useNavigate();
  const {
    deals,
    stats,
    owners,
    pipelineStages,
    isLoading,
    searchQuery,
    setSearchQuery,
    ownerFilter,
    setOwnerFilter,
    stageFilter,
    setStageFilter,
    getStageDeals,
    getStageValue,
    moveDeal,
    isMoving,
  } = useSalesPage();

  // Fetch leads (unconverted leads that can be converted to deals)
  const { data: leadsData, isLoading: leadsLoading } = useLeads({ is_converted: false });
  const unconvertedLeads = leadsData?.results || [];

  const moveDealMutation = useMoveDealToStage();
  const convertLeadMutation = useConvertLead();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'deal' | 'lead'; data: Deal | Lead } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Pipeline stages configuration (map backend stages to frontend stages)
  const defaultStages = [
    { key: 'lead', label: 'Lead', color: 'blue', icon: FiTarget },
    { key: 'qualified', label: 'Qualified', color: 'cyan', icon: FiUser },
    { key: 'proposal', label: 'Proposal', color: 'purple', icon: FiCalendar },
    { key: 'negotiation', label: 'Negotiation', color: 'orange', icon: FiTrendingUp },
    { key: 'closed-won', label: 'Closed Won', color: 'green', icon: FiAward },
  ];

  // Map pipeline stages from backend to frontend format
  const mappedStages = useMemo(() => {
    if (pipelineStages && pipelineStages.length > 0) {
      return pipelineStages.map((stage, index) => {
        // Try to match stage name to default stages
        const stageNameLower = stage.name.toLowerCase();
        let matchedStage = defaultStages.find(ds => 
          stageNameLower.includes(ds.key) || ds.key.includes(stageNameLower)
        );
        
        if (!matchedStage) {
          // Use default stage based on order
          matchedStage = defaultStages[index] || defaultStages[0];
        }

        return {
          id: stage.id,
          name: stage.name,
          key: matchedStage.key,
          label: stage.name,
          color: matchedStage.color,
          icon: matchedStage.icon,
        };
      });
    }
    return defaultStages;
  }, [pipelineStages]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter deals and leads based on search and filters
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = searchQuery === '' || 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.customer_name && deal.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesOwner = ownerFilter === 'all' || deal.assigned_to_name === ownerFilter;
      const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;

      return matchesSearch && matchesOwner && matchesStage;
    });
  }, [deals, searchQuery, ownerFilter, stageFilter]);

  const filteredLeads = useMemo(() => {
    return unconvertedLeads.filter(lead => {
      const matchesSearch = searchQuery === '' || 
        (lead.name && lead.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.organization_name && lead.organization_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesOwner = ownerFilter === 'all' || lead.assigned_to_name === ownerFilter;

      return matchesSearch && matchesOwner;
    });
  }, [unconvertedLeads, searchQuery, ownerFilter]);

  // Get items for each stage
  const getStageItems = (stageKey: string) => {
    // Find deals in this stage
    const stageDeals = filteredDeals.filter(deal => {
      // Match by stage key or stage name
      const dealStage = deal.stage || deal.stage_name?.toLowerCase() || '';
      const stageKeyLower = stageKey.toLowerCase();
      return dealStage === stageKeyLower || 
             dealStage.includes(stageKeyLower) ||
             stageKeyLower.includes(dealStage);
    });
    
    // Show unconverted leads only in the first "lead" stage
    // Once a lead is converted to a deal, it will appear as a deal in its stage
    const firstLeadStage = mappedStages.find(s => s.key === 'lead');
    const isLeadStage = stageKey === 'lead' || 
                       (firstLeadStage && mappedStages.find(s => s.key === stageKey)?.id === firstLeadStage.id);
    const stageLeads = isLeadStage ? filteredLeads : [];
    
    return { deals: stageDeals, leads: stageLeads };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Find the dragged item
    const itemId = active.id as string;
    if (itemId.startsWith('deal-')) {
      const dealId = parseInt(itemId.replace('deal-', ''));
      const deal = filteredDeals.find(d => d.id === dealId);
      if (deal) {
        setDraggedItem({ type: 'deal', data: deal });
      }
    } else if (itemId.startsWith('lead-')) {
      const leadId = parseInt(itemId.replace('lead-', ''));
      const lead = filteredLeads.find(l => l.id === leadId);
      if (lead) {
        setDraggedItem({ type: 'lead', data: lead });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedItem(null);

    if (!over) return;

    const itemId = active.id as string;
    
    // Get the target stage - over.id should be the stage key when dropped on a stage column
    const targetStageKey = over.id as string;

    // Find target stage by key
    const targetStage = mappedStages.find(s => s.key === targetStageKey);

    if (!targetStage || !targetStage.id) {
      toaster.create({
        title: 'Error',
        description: 'Target stage not found',
        type: 'error',
      });
      return;
    }

    try {
      if (itemId.startsWith('deal-')) {
        // Move deal to new stage
        const dealId = parseInt(itemId.replace('deal-', ''));
        await moveDealMutation.mutateAsync({ id: dealId, stageId: targetStage.id });
        
        // If moving to closed-won, customer will be created by backend
        if (targetStage.key === 'closed-won') {
          toaster.create({
            title: 'Deal won!',
            description: 'Deal marked as won. Customer will be created automatically.',
            type: 'success',
          });
        }
      } else if (itemId.startsWith('lead-')) {
        // Convert lead to deal when dragged to any stage
        const leadId = parseInt(itemId.replace('lead-', ''));
        const lead = filteredLeads.find(l => l.id === leadId);
        
        if (!lead) {
          toaster.create({
            title: 'Error',
            description: 'Lead not found',
            type: 'error',
          });
          return;
        }

        // Create a deal from the lead
        // First, we need to get the target stage (or first stage if dragging to lead stage)
        const targetStageForDeal = targetStage.key === 'lead' 
          ? mappedStages.find(s => s.key === 'lead') || mappedStages[0]
          : targetStage;
        
        if (!targetStageForDeal || !targetStageForDeal.id) {
          toaster.create({
            title: 'Error',
            description: 'Pipeline stage not found. Please ensure you have a pipeline configured.',
            type: 'error',
          });
          return;
        }

        // Import deal service
        const { dealService } = await import('@/services');
        
        // Create deal from lead (customer will be created when deal is won)
        try {
          const dealData: any = {
            title: lead.name || lead.organization_name || `Deal for ${lead.email || 'Lead'}`,
            value: typeof lead.estimated_value === 'string' 
              ? parseFloat(lead.estimated_value) 
              : lead.estimated_value || 0,
            stage: targetStageForDeal.id,
            lead: leadId, // Pass lead_id to create deal from lead
            description: lead.notes || `Converted from lead: ${lead.name || lead.organization_name}`,
          };

          // Add assigned_to if available
          if (lead.assigned_to) {
            dealData.assigned_to = typeof lead.assigned_to === 'object' 
              ? lead.assigned_to.id 
              : lead.assigned_to;
          }

          // Create deal from lead (no customer required - will be created when deal is won)
          await dealService.createDeal(dealData);

          // Mark lead as converted
          await convertLeadMutation.mutateAsync({
            id: leadId,
            data: { customer_type: 'individual' },
          });

          toaster.create({
            title: 'Lead converted',
            description: 'Lead has been converted to a deal. Customer will be created when deal is won.',
            type: 'success',
          });
        } catch (error: any) {
          toaster.create({
            title: 'Error creating deal',
            description: error.response?.data?.detail || error.response?.data?.customer?.[0] || 'Failed to create deal from lead.',
            type: 'error',
          });
        }
      }
    } catch (error: any) {
      toaster.create({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to move item',
        type: 'error',
      });
    }
  };

  // Calculate stats
  const pipelineValue = useMemo(() => {
    return filteredDeals.reduce((sum, deal) => {
      const value = typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;
      return sum + (value || 0);
    }, 0);
  }, [filteredDeals]);

  const openDeals = filteredDeals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost').length;
  const wonDeals = filteredDeals.filter(d => d.stage === 'closed-won').length;
  const wonValue = filteredDeals
    .filter(d => d.stage === 'closed-won')
    .reduce((sum, deal) => {
      const value = typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;
      return sum + (value || 0);
    }, 0);

  if (isLoading || leadsLoading) {
    return (
      <DashboardLayout title="Sales Pipeline">
        <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
          <VStack gap={4}>
            <Spinner size="xl" color="purple.500" />
            <Text fontSize="md" color="gray.600">
              Loading sales pipeline...
            </Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sales Pipeline">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <VStack align="stretch" gap={5}>
          {/* Page Header */}
          <Box>
            <Heading size="2xl" mb={2}>
              Sales Pipeline
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Manage deals and leads through every stage of your sales process. Drag and drop to move items between stages.
            </Text>
          </Box>

          {/* Stats Overview */}
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
            gap={5}
          >
            {/* Total Pipeline Value */}
            <Box
              bg="white"
              borderRadius="xl"
              boxShadow="sm"
              p={{ base: 5, md: 6 }}
              borderWidth="1px"
              borderColor="gray.200"
            >
              <HStack justify="space-between" align="start" mb={4}>
                <VStack align="start" gap={1} flex={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    Pipeline Value
                  </Text>
                  <Heading size={{ base: '3xl', md: '4xl' }} color="gray.900">
                    {formatCurrency(pipelineValue)}
                  </Heading>
                </VStack>
                <Box p={3.5} bg="blue.100" borderRadius="lg">
                  <FiDollarSign size={24} color="var(--blue-600)" />
                </Box>
              </HStack>
            </Box>

            {/* Open Deals */}
            <Box
              bg="white"
              borderRadius="xl"
              boxShadow="sm"
              p={{ base: 5, md: 6 }}
              borderWidth="1px"
              borderColor="gray.200"
            >
              <HStack justify="space-between" align="start" mb={4}>
                <VStack align="start" gap={1} flex={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    Open Deals
                  </Text>
                  <Heading size={{ base: '3xl', md: '4xl' }} color="gray.900">
                    {openDeals}
                  </Heading>
                </VStack>
                <Box p={3.5} bg="purple.100" borderRadius="lg">
                  <FiTarget size={24} color="var(--purple-600)" />
                </Box>
              </HStack>
            </Box>

            {/* Won Deals */}
            <Box
              bg="white"
              borderRadius="xl"
              boxShadow="sm"
              p={{ base: 5, md: 6 }}
              borderWidth="1px"
              borderColor="gray.200"
            >
              <HStack justify="space-between" align="start" mb={4}>
                <VStack align="start" gap={1} flex={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    Closed Won
                  </Text>
                  <Heading size={{ base: '3xl', md: '4xl' }} color="gray.900">
                    {wonDeals}
                  </Heading>
                </VStack>
                <Box p={3.5} bg="green.100" borderRadius="lg">
                  <FiAward size={24} color="var(--green-600)" />
                </Box>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                {formatCurrency(wonValue)} revenue
              </Text>
            </Box>

            {/* Win Rate */}
            <Box
              bg="white"
              borderRadius="xl"
              boxShadow="sm"
              p={{ base: 5, md: 6 }}
              borderWidth="1px"
              borderColor="gray.200"
            >
              <HStack justify="space-between" align="start" mb={4}>
                <VStack align="start" gap={1} flex={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    Win Rate
                  </Text>
                  <Heading size={{ base: '3xl', md: '4xl' }} color="gray.900">
                    {wonDeals + openDeals > 0 
                      ? Math.round((wonDeals / (wonDeals + openDeals)) * 100)
                      : 0}%
                  </Heading>
                </VStack>
                <Box p={3.5} bg="orange.100" borderRadius="lg">
                  <FiTrendingUp size={24} color="var(--orange-600)" />
                </Box>
              </HStack>
            </Box>
          </Grid>

          {/* Filters and Actions Bar */}
          <Stack
            direction={{ base: 'column', md: 'row' }}
            gap={4}
            justifyContent="space-between"
            alignItems={{ base: 'stretch', md: 'center' }}
          >
            {/* Search and Filter */}
            <Stack direction={{ base: 'column', sm: 'row' }} gap={3} flex="1">
              <Box position="relative" flex="1" maxW={{ base: '100%', md: '400px' }}>
                <Box
                  position="absolute"
                  left="12px"
                  top="50%"
                  transform="translateY(-50%)"
                  pointerEvents="none"
                  color="gray.400"
                >
                  <FiSearch size={20} />
                </Box>
                <Input
                  placeholder="Search deals, leads, or customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pl="40px"
                  h="40px"
                  borderRadius="lg"
                />
              </Box>

              <CustomSelect
                value={stageFilter}
                onChange={setStageFilter}
                options={[
                  { value: 'all', label: 'All Stages' },
                  ...mappedStages.map(stage => ({
                    value: stage.key,
                    label: stage.label
                  }))
                ]}
                width={{ base: '100%', sm: '180px' }}
                accentColor="purple"
              />

              <CustomSelect
                value={ownerFilter}
                onChange={setOwnerFilter}
                options={[
                  { value: 'all', label: 'All Employees' },
                  ...owners.map(owner => ({
                    value: owner,
                    label: owner
                  }))
                ]}
                width={{ base: '100%', sm: '200px' }}
                accentColor="purple"
              />
            </Stack>

            {/* Action Buttons */}
            <HStack gap={2}>
              <Button
                variant="outline"
                h="40px"
                display={{ base: 'none', sm: 'inline-flex' }}
              >
                <FiFilter />
                <Box ml={2}>More Filters</Box>
              </Button>

              <Button
                colorPalette="purple"
                h="40px"
                onClick={() => navigate('/leads/new')}
              >
                <FiPlus />
                <Box ml={2}>New Lead</Box>
              </Button>
            </HStack>
          </Stack>

          {/* Pipeline Kanban Board */}
          <Box>
            <Box mb={4}>
              <Heading size="lg" color="gray.900" mb={1}>
                Pipeline Board
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'} 
                {filteredLeads.length > 0 && `, ${filteredLeads.length} ${filteredLeads.length === 1 ? 'lead' : 'leads'}`}
                {searchQuery || ownerFilter !== 'all' || stageFilter !== 'all' ? ' (filtered)' : ''}
              </Text>
            </Box>
            
            {/* Pipeline Grid with Drag and Drop */}
            <Box
              overflowX="auto"
              pb={2}
              css={{
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '8px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555',
                },
              }}
            >
              <HStack
                align="start"
                gap={4}
                minW={{ base: 'max-content', xl: 'auto' }}
                pb={2}
              >
                {mappedStages.map((stage) => {
                  const { deals: stageDeals, leads: stageLeads } = getStageItems(stage.key);
                  
                  return (
                    <Box
                      key={stage.key}
                      id={stage.key}
                      data-stage-id={stage.id}
                      style={{ minHeight: '600px' }}
                    >
                      <StageColumn
                        stage={stage}
                        deals={stageDeals}
                        leads={stageLeads}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        onDealClick={(deal) => navigate(`/deals/${deal.id}`)}
                        onLeadClick={(lead) => navigate(`/leads/${lead.id}`)}
                      />
                    </Box>
                  );
                })}
              </HStack>
            </Box>
          </Box>

          {/* Drag Overlay */}
          <DragOverlay>
            {draggedItem ? (
              draggedItem.type === 'deal' ? (
                <Box
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor="purple.400"
                  boxShadow="xl"
                  w="300px"
                >
                  <Text fontWeight="semibold" fontSize="sm">
                    {(draggedItem.data as Deal).title}
                  </Text>
                </Box>
              ) : (
                <Box
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor="blue.400"
                  boxShadow="xl"
                  w="300px"
                >
                  <Text fontWeight="semibold" fontSize="sm">
                    {(draggedItem.data as Lead).name || (draggedItem.data as Lead).organization_name}
                  </Text>
                </Box>
              )
            ) : null}
          </DragOverlay>
        </VStack>
      </DndContext>
    </DashboardLayout>
  );
};

export default SalesPage;
