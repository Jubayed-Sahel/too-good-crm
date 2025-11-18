import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  DndContext, 
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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
  FiEye,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CustomSelect from '../components/ui/CustomSelect';
import { useSalesPage } from '@/hooks/useSalesPage';
import { useLeads, useCreateLead, useDeleteLead } from '@/hooks';
import { useMoveDealToStage } from '@/hooks/useDealMutations';
import { useConvertLead, useConvertLeadToDeal } from '@/hooks/useLeadMutations';
import { toaster } from '@/components/ui/toaster';
import { CreateLeadDialog } from '@/components/leads';
import { useProfile } from '@/contexts/ProfileContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { usePermissionActions } from '@/hooks/usePermissionActions';
import { transformLeadFormData, cleanFormData } from '@/utils/formTransformers';
import type { Deal } from '@/types';
import type { Lead } from '@/types/lead.types';
import type { CreateLeadData } from '@/types';

// Define drag event types for @dnd-kit
interface DragStartEvent {
  active: { id: string | number };
}

interface DragEndEvent {
  active: { id: string | number };
  over: { id: string | number } | null;
}

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
    opacity: isDragging ? 0.85 : 1, // Less opacity change so buttons remain visible during drag
  };

  const dealValue = typeof deal.value === 'string' ? parseFloat(deal.value) : (deal.value || 0);

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
      id={`deal-${deal.id}`}
      data-id={`deal-${deal.id}`}
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
  onView?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onMoveToStage?: (lead: Lead, stageKey: string, stageId?: number) => void;
  availableStages?: Array<{ key: string; label: string; id?: number }>;
}

function SortableLeadCard({ lead, stageColor, formatCurrency, formatDate, onView, onEdit, onDelete, onMoveToStage, availableStages }: SortableLeadCardProps) {
  const [movingStageId, setMovingStageId] = useState<number | null>(null);
  
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
    opacity: isDragging ? 0.85 : 1, // Less opacity change so buttons remain visible during drag
  };

  // Parse estimated_value - handle string, number, or null/undefined
  const estimatedValue = lead.estimated_value !== null && lead.estimated_value !== undefined
    ? (typeof lead.estimated_value === 'string' ? parseFloat(lead.estimated_value) : lead.estimated_value)
    : 0;

  // Determine stage color based on lead's current stage
  const getStageColor = () => {
    if (!lead.stage_name) return 'gray';
    const stageNameLower = lead.stage_name.toLowerCase();
    if (stageNameLower.includes('lead') || stageNameLower === 'new') return 'blue';
    if (stageNameLower.includes('qualified')) return 'cyan';
    if (stageNameLower.includes('proposal')) return 'purple';
    if (stageNameLower.includes('negotiation')) return 'orange';
    if (stageNameLower.includes('won') || stageNameLower.includes('closed-won')) return 'green';
    if (stageNameLower.includes('lost') || stageNameLower.includes('closed-lost')) return 'red';
    return 'gray';
  };

  const currentStageColor = getStageColor();

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
      id={`lead-${lead.id}`}
      data-id={`lead-${lead.id}`}
      {...attributes}
      {...listeners}
    >
      <VStack align="stretch" gap={3}>
        {/* Header with Badge and Action Buttons */}
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={1} style={{ flex: 1 }}>
            <Badge colorPalette="blue" size="sm" w="fit-content">
              Lead
            </Badge>
            {/* Current Stage Display */}
            {lead.stage_name && (
              <Badge
                colorPalette={currentStageColor}
                size="sm"
                variant="solid"
                w="fit-content"
                fontWeight="bold"
              >
                {lead.stage_name}
              </Badge>
            )}
          </VStack>
          <HStack 
            gap={1} 
            onClick={(e) => e.stopPropagation()} 
            onPointerDown={(e) => e.stopPropagation()} 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', zIndex: 10 }}
          >
            {onView && (
              <Button
                size="xs"
                variant="ghost"
                colorPalette="blue"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('View button clicked for lead:', lead.id);
                  onView(lead);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                title="View Lead"
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                <FiEye size={14} />
              </Button>
            )}
            {onEdit && (
              <Button
                size="xs"
                variant="ghost"
                colorPalette="purple"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Edit button clicked for lead:', lead.id);
                  onEdit(lead);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                title="Edit Lead"
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                <FiEdit size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                size="xs"
                variant="ghost"
                colorPalette="red"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Delete button clicked for lead:', lead.id);
                  onDelete(lead);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                title="Delete Lead"
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                <FiTrash2 size={14} />
              </Button>
            )}
          </HStack>
        </HStack>
        
        {/* Lead Name */}
        <Text
          fontWeight="bold"
          fontSize="sm"
          color="gray.900"
          lineHeight="1.4"
          cursor="pointer"
          onClick={() => onView?.(lead)}
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

                {/* Stage Transition Buttons */}
                {onMoveToStage && availableStages && availableStages.length > 0 && (
                  <VStack 
                    align="stretch" 
                    gap={2} 
                    pt={2} 
                    borderTop="1px" 
                    borderColor="gray.100"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                      Move to:
                    </Text>
                    <HStack 
                      gap={1} 
                      flexWrap="wrap"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                    >
                      {availableStages
                        .filter((stage) => {
                          // Filter out the current stage - don't show button for current stage
                          const currentStageId = (lead as any).stage_id || (lead as any).stage?.id;
                          const currentStageKey = (lead as any).stage_key || (lead as any).stage?.key;
                          // Don't show button if it's the current stage (by ID or key)
                          if (currentStageId && stage.id && stage.id === currentStageId) {
                            return false;
                          }
                          if (currentStageKey && stage.key === currentStageKey) {
                            return false;
                          }
                          // Show all other stages (even if they don't have IDs yet - handler will find them)
                          return true;
                        })
                        .map((stage) => {
                        // Determine color based on stage key
                        let colorPalette = 'gray';
                        if (stage.key === 'lead') colorPalette = 'blue';
                        else if (stage.key === 'qualified') colorPalette = 'cyan';
                        else if (stage.key === 'proposal') colorPalette = 'purple';
                        else if (stage.key === 'negotiation') colorPalette = 'orange';
                        else if (stage.key === 'closed-won') colorPalette = 'green';
                        
                        const isMoving = stage.id !== undefined && movingStageId === stage.id;
                        
                        return (
                          <Button
                            key={stage.key}
                            size="xs"
                            variant="outline"
                            colorPalette={colorPalette}
                            disabled={isMoving || movingStageId !== null}
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.nativeEvent) {
                                e.nativeEvent.stopImmediatePropagation();
                              }
                              
                              if (!onMoveToStage) {
                                console.warn('onMoveToStage is not defined');
                                return;
                              }
                              
                              // Note: stage.id might be undefined, but handler will look it up
                              if (!stage.id) {
                                console.warn('Stage ID is missing for stage:', stage.key, 'Handler will attempt to find it');
                              }
                              
                              // Set loading state (use stage.id if available, otherwise use a temporary identifier)
                              setMovingStageId(stage.id || null);
                              
                              try {
                                console.log('Stage button clicked:', stage.key, 'for lead:', lead.id, 'stageId:', stage.id);
                                console.log('Full stage object:', stage);
                                
                                // Call the move handler
                                await onMoveToStage(lead, stage.key, stage.id);
                                
                                console.log('Lead moved successfully');
                              } catch (error) {
                                console.error('Error moving lead:', error);
                                // Error is already handled by the handler
                              } finally {
                                // Clear loading state after a short delay
                                setTimeout(() => {
                                  setMovingStageId(null);
                                }, 500);
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.nativeEvent) {
                                e.nativeEvent.stopImmediatePropagation();
                              }
                            }}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onTouchStart={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            title={`Move to ${stage.label}`}
                            style={{ pointerEvents: 'auto', zIndex: 20, position: 'relative' }}
                          >
                            {isMoving ? 'Moving...' : stage.label}
                          </Button>
                        );
                      })}
            </HStack>
          </VStack>
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
  stage: { id?: number; name: string; key: string; color: string; icon: any; label?: string };
  deals: Deal[];
  leads: Lead[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  onDealClick?: (deal: Deal) => void;
  onLeadClick?: (lead: Lead) => void;
  onLeadView?: (lead: Lead) => void;
  onLeadEdit?: (lead: Lead) => void;
  onLeadDelete?: (lead: Lead) => void;
  onLeadMoveToStage?: (lead: Lead, stageKey: string, stageId?: number) => void;
  availableStages?: Array<{ key: string; label: string; id?: number }>;
}

function StageColumn({ stage, deals, leads, formatCurrency, formatDate, onDealClick, onLeadClick, onLeadView, onLeadEdit, onLeadDelete, onLeadMoveToStage, availableStages }: StageColumnProps) {
  // Use stage key as droppable ID
  const stageDroppableId = stage.key;
  const { setNodeRef, isOver } = useDroppable({
    id: stageDroppableId,
  });
  const StageIcon = stage.icon;
  // Filter out any invalid leads/deals before creating items
  const validDeals = deals.filter(d => d && d.id);
  const validLeads = leads.filter(l => l && l.id && l.name); // Ensure lead has name too
  const allItems = [
    ...validDeals.map(d => ({ type: 'deal' as const, id: `deal-${d.id}`, data: d })),
    ...validLeads.map(l => ({ type: 'lead' as const, id: `lead-${l.id}`, data: l })),
  ];

  // Calculate stage value from both deals and leads (only valid ones)
  const stageValue = [
    ...validDeals.map(deal => {
    const value = typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;
      return value || 0;
    }),
    ...validLeads.map(lead => {
      const estimatedValue = lead.estimated_value !== null && lead.estimated_value !== undefined
        ? (typeof lead.estimated_value === 'string' ? parseFloat(lead.estimated_value) : lead.estimated_value)
        : 0;
      return estimatedValue || 0;
    })
  ].reduce((sum, value) => sum + value, 0);

  return (
    <VStack
      ref={setNodeRef}
      id={stageDroppableId}
      data-stage-id={stage.id}
      data-stage-key={stage.key}
      align="stretch"
      bg={isOver ? `${stage.color}.50` : 'white'}
      borderRadius="xl"
      borderWidth={isOver ? '2px' : '1px'}
      borderColor={isOver ? `${stage.color}.400` : 'gray.200'}
      borderStyle={isOver ? 'dashed' : 'solid'}
      w={{ base: '320px', md: '300px' }}
      minH="600px"
      maxH="calc(100vh - 450px)"
      flexShrink={0}
      boxShadow={isOver ? 'md' : 'sm'}
      transition="all 0.2s ease"
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
                              onView={onLeadView}
                              onEdit={onLeadEdit}
                              onDelete={onLeadDelete}
                              onMoveToStage={onLeadMoveToStage}
                              availableStages={availableStages}
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
  const { activeOrganizationId, activeProfile } = useProfile();
  const { isVendor, isLoading: permissionsLoading } = usePermissions();
  const leadsPermissions = usePermissionActions('leads');
  
  // For vendors, always allow creating leads (even if permissions are still loading)
  // This ensures the button is visible immediately for vendors
  const canCreateLead = isVendor || leadsPermissions.canCreate;
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

  const queryClient = useQueryClient();

  // Fetch all leads (leads can be in any stage now)
  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = useLeads({});
  const allLeads = leadsData?.results || [];
  
  // Get all deals from useSalesPage (already filtered)
  const allDeals = deals || [];
  
  // Force refetch leads and deals on mount and clear cache to remove stale data
  useEffect(() => {
    // Clear all lead-related queries from cache to remove any stale/deleted leads
    queryClient.removeQueries({ queryKey: ['leads'] });
    // Clear all deal-related queries from cache to remove any stale/deleted deals
    queryClient.removeQueries({ queryKey: ['deals'] });
    // Invalidate and refetch to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['deals'] });
    // Then refetch fresh data
    refetchLeads();
    queryClient.refetchQueries({ queryKey: ['deals'] });
  }, [refetchLeads, queryClient]);

  // Filter out any invalid/deleted deals (defensive check)
  const validDeals = useMemo(() => {
    return allDeals.filter((deal: any) => {
      // Must have id and title/name
      if (!deal || !deal.id || (!deal.title && !deal.name)) {
        return false;
      }
      // Additional check: ensure deal has valid data (not a stale/empty object)
      if (deal.title === '' && deal.name === '') {
        return false;
      }
      return true;
    });
  }, [allDeals]);
  
  // Filter out any invalid/deleted leads (defensive check)
  const validLeads = useMemo(() => {
    return allLeads.filter(lead => {
      // Must have id
      if (!lead || !lead.id) {
        return false;
      }
      // Additional check: ensure lead has valid name (not a stale/empty object)
      if (!lead.name && !lead.organization_name) {
        return false;
      }
      return true;
    });
  }, [allLeads]);

  const moveDealMutation = useMoveDealToStage();
  const convertLeadMutation = useConvertLead();
  const convertLeadToDealMutation = useConvertLeadToDeal();
  const createLead = useCreateLead();
  const deleteLead = useDeleteLead();
  
  // Create Lead Dialog state - use useState instead of useDisclosure
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  
  const handleOpenDialog = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
  };
  
  // Handle view lead
  const handleViewLead = (lead: Lead) => {
    console.log('Navigating to view lead:', lead.id);
    navigate(`/leads/${lead.id}`);
  };
  
  // Handle edit lead
  const handleEditLead = (lead: Lead) => {
    console.log('Navigating to edit lead:', lead.id);
    navigate(`/leads/${lead.id}/edit`);
  };
  
  // Handle delete lead
  const handleDeleteLead = (lead: Lead) => {
    console.log('handleDeleteLead called with lead:', lead);
    setLeadToDelete(lead);
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete "${lead.name || lead.organization_name || 'this lead'}"? This action cannot be undone.`);
    console.log('Delete confirmation:', confirmed);
    
    if (confirmed) {
      console.log('Deleting lead with ID:', lead.id);
      deleteLead.mutate(lead.id, {
        onSuccess: async (data) => {
          console.log('Lead deleted successfully:', data);
          toaster.create({
            title: 'Lead deleted successfully',
            type: 'success',
          });
          setLeadToDelete(null);
          // Force refetch leads to update the UI immediately
          await refetchLeads();
          // Also invalidate and refetch to ensure all queries are updated
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          queryClient.refetchQueries({ queryKey: ['leads'], exact: false });
        },
        onError: (err: any) => {
          console.error('Error deleting lead:', err);
          toaster.create({
            title: 'Failed to delete lead',
            description: err.response?.data?.detail || err.response?.data?.error || 'An error occurred while deleting the lead.',
            type: 'error',
          });
          setLeadToDelete(null);
        },
      });
    } else {
      console.log('Delete cancelled by user');
      setLeadToDelete(null);
    }
  };
  
  // Handle move lead to stage (just move, no conversion)
  const handleMoveLeadToStage = async (lead: Lead, stageKey: string, stageId?: number) => {
    console.log('handleMoveLeadToStage called:', { 
      leadId: lead.id, 
      stageKey, 
      stageId, 
      mappedStages, 
      pipelineStages,
      pipelineStagesCount: pipelineStages?.length 
    });
    
    let finalStageId = stageId;
    
    // If stageId is not provided, we MUST find it from pipelineStages
    if (!finalStageId) {
      // Use the utility function to find stage ID by name
      const { findStageIdByName } = await import('@/utils/formTransformers');
      
      // Get current pipeline stages - check if they're available
      let stagesToUse = pipelineStages;
      
      // If pipelineStages is empty, try to fetch them
      if (!stagesToUse || stagesToUse.length === 0) {
        console.warn('pipelineStages is empty, attempting to fetch...');
        console.log('Current pipelineStages from hook:', pipelineStages);
        try {
          const { dealService } = await import('@/services');
          
          // First, get pipelines to find the default one
          const pipelines = await dealService.getPipelines();
          console.log('Fetched pipelines:', pipelines);
          
          const defaultPipeline = pipelines?.find(p => p.is_default) || pipelines?.[0];
          console.log('Default pipeline:', defaultPipeline);
          
          // Check if stages are in the pipeline object
          if (defaultPipeline) {
            stagesToUse = defaultPipeline.stages || [];
            console.log('Pipeline stages from default pipeline:', stagesToUse);
            
            // If stages are still empty, fetch them separately using the pipeline ID
            if (!stagesToUse || stagesToUse.length === 0) {
              console.warn('Pipeline has no stages property, fetching stages separately...');
              try {
                // Fetch stages for the default pipeline
                stagesToUse = await dealService.getPipelineStages(defaultPipeline.id);
                console.log('Fetched stages separately:', stagesToUse);
              } catch (stageError) {
                console.error('Failed to fetch stages separately:', stageError);
                // Fallback: try to get all stages without pipeline filter
                try {
                  stagesToUse = await dealService.getPipelineStages();
                  console.log('Fetched all stages:', stagesToUse);
                } catch (allStagesError) {
                  console.error('Failed to fetch all stages:', allStagesError);
                }
              }
            }
          } else {
            // No pipeline found, try to get all stages
            console.warn('No pipeline found, fetching all stages...');
            stagesToUse = await dealService.getPipelineStages();
            console.log('Fetched all stages:', stagesToUse);
          }
        } catch (error) {
          console.error('Failed to fetch pipeline stages:', error);
        }
      }
      
      if (stagesToUse && stagesToUse.length > 0) {
        // Convert pipelineStages to the format expected by findStageIdByName
        const stagesForLookup = stagesToUse.map(ps => ({ id: ps.id, name: ps.name }));
        
        // Try to find stage ID using the stage key (e.g., 'closed-won')
        const foundId = findStageIdByName(stageKey, stagesForLookup);
        finalStageId = foundId || undefined;
        
        console.log('Stage ID lookup result:', { stageKey, finalStageId, stagesForLookup });
        
        // If still not found, try finding by mapped stage name
        if (!finalStageId) {
          const targetStage = mappedStages.find(s => s.key === stageKey);
          if (targetStage?.name) {
            const foundByName = findStageIdByName(targetStage.name, stagesForLookup);
            finalStageId = foundByName || undefined;
            console.log('Tried with mapped stage name:', { name: targetStage.name, finalStageId });
          }
        }
      } else {
        console.error('No pipeline stages available after fetch attempt!');
      }
    }
    
    // If still no ID found, we'll still try to move - backend will create pipeline if needed
    if (!finalStageId || finalStageId === undefined) {
      console.warn('⚠️ Stage ID lookup failed, but will attempt move with stage_key - backend will create pipeline if needed');
      console.warn('Details:', {
        stageKey,
        providedStageId: stageId,
        mappedStages: mappedStages.map(s => ({ key: s.key, id: s.id, name: s.name })),
        pipelineStages: pipelineStages?.map(ps => ({ id: ps.id, name: ps.name })),
      });
      // Don't return - let backend handle pipeline creation
      finalStageId = 0; // Use 0 as placeholder - backend will find/create by name
    }
    
    console.log('Moving lead to stage:', { leadId: lead.id, stageId: finalStageId });
    
    try {
      const { leadService } = await import('@/services');
      
      // Try the move_stage endpoint first, with fallback to direct update
      let result;
      let useFallback = false;
      
      try {
        // Send stage_key and stage_name to help backend find/create stages
        const targetStage = mappedStages.find(s => s.key === stageKey);
        result = await leadService.moveLeadStage(
          lead.id, 
          finalStageId || 0, // Send 0 if no ID found - backend will create pipeline and find by name
          stageKey,
          targetStage?.name
        );
        console.log('Lead moved successfully via move_stage endpoint:', result);
      } catch (moveError: any) {
        console.log('move_stage endpoint error:', moveError);
        console.log('Error response:', moveError.response);
        console.log('Error status:', moveError.response?.status);
        console.log('Error message:', moveError.message);
        console.log('Error data:', moveError.response?.data);
        
        // Check if it's a 404 error (endpoint not found) OR pipeline not found error
        const is404 = moveError.response?.status === 404 || 
                     moveError.response?.statusCode === 404 ||
                     moveError.message?.includes('404') ||
                     moveError.message?.includes('Not Found');
        
        // Also check for pipeline-related errors that should trigger fallback
        const errorMessage = moveError.message || '';
        const errorData = moveError.response?.data || {};
        const errorText = JSON.stringify(errorData).toLowerCase();
        
        const isPipelineError = errorMessage.includes('No active pipeline') ||
                               errorMessage.includes('pipeline') ||
                               errorText.includes('pipeline') ||
                               errorText.includes('no active pipeline');
        
        // Always use fallback for 404 or pipeline errors
        if (is404 || isPipelineError) {
          console.warn('move_stage endpoint failed (404 or pipeline error), trying direct update...');
          console.warn('Error details:', { is404, isPipelineError, errorMessage, errorData });
          useFallback = true;
        } else {
          // For other errors, throw them immediately
          throw moveError;
        }
      }
      
      // If move_stage returned 404, use fallback
      if (useFallback) {
        try {
          console.log('Using fallback: updating lead directly with stage_id:', finalStageId);
          result = await leadService.updateLead(lead.id, { stage_id: finalStageId } as any);
          console.log('Lead moved successfully via direct update:', result);
        } catch (updateError: any) {
          console.error('Direct update also failed:', updateError);
          console.error('Update error response:', updateError.response);
          throw updateError;
        }
      }
      
      // Invalidate and remove React Query cache to refresh the data
      queryClient.removeQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      // Refetch leads to get updated data
      refetchLeads();
      
      toaster.create({
        title: 'Lead moved',
        description: `Lead moved to ${mappedStages.find(s => s.key === stageKey)?.name || stageKey} stage.`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('Error moving lead:', error);
      console.error('Error details:', error.response?.data);
      toaster.create({
        title: 'Error',
        description: error.response?.data?.error || error.response?.data?.detail || 'Failed to move lead. Please try again.',
        type: 'error',
      });
      // Re-throw error so button handler can catch it
      throw error;
    }
  };

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'deal' | 'lead'; data: Deal | Lead } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts (allows button clicks)
      },
    }),
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
  // Always show all default stages, and merge with backend stages if available
  const mappedStages = useMemo(() => {
    // Always start with default stages to ensure all are shown
    const stagesMap = new Map();
    
    // First, add all default stages
    defaultStages.forEach((defaultStage, index) => {
      stagesMap.set(defaultStage.key, {
        id: undefined,
        name: defaultStage.label,
        key: defaultStage.key,
        label: defaultStage.label,
        color: defaultStage.color,
        icon: defaultStage.icon,
      });
    });
    
    // Then, update with backend stages if available
    if (pipelineStages && pipelineStages.length > 0) {
      pipelineStages.forEach((stage, index) => {
        // Try to match stage name to default stages
        const stageNameLower = stage.name.toLowerCase().trim();
        let matchedStage = defaultStages.find(ds => {
          const dsKey = ds.key.toLowerCase();
          const dsLabel = ds.label.toLowerCase();
          // Try multiple matching strategies
          return stageNameLower === dsKey ||
                 stageNameLower === dsLabel ||
                 stageNameLower.includes(dsKey) ||
                 dsKey.includes(stageNameLower) ||
                 stageNameLower.includes(dsLabel) ||
                 dsLabel.includes(stageNameLower);
        });
        
        if (!matchedStage) {
          // Use default stage based on order as fallback
          matchedStage = defaultStages[index] || defaultStages[0];
        }

        // Update the stage with backend data
        stagesMap.set(matchedStage.key, {
          id: stage.id,
          name: stage.name,
          key: matchedStage.key,
          label: stage.name,
          color: matchedStage.color,
          icon: matchedStage.icon,
        });
      });
    }
    
    // Return all stages in the default order
    return defaultStages.map(ds => stagesMap.get(ds.key) || ds);
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
    return validDeals.filter(deal => {
      const matchesSearch = searchQuery === '' || 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.customer_name && deal.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesOwner = ownerFilter === 'all' || deal.assigned_to_name === ownerFilter;
      const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;

      return matchesSearch && matchesOwner && matchesStage;
    });
  }, [validDeals, searchQuery, ownerFilter, stageFilter]);

  const filteredLeads = useMemo(() => {
    return validLeads.filter(lead => {
      const matchesSearch = searchQuery === '' || 
        (lead.name && lead.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.organization_name && lead.organization_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesOwner = ownerFilter === 'all' || lead.assigned_to_name === ownerFilter;

      return matchesSearch && matchesOwner;
    });
  }, [validLeads, searchQuery, ownerFilter]);

  // Get items for each stage
  const getStageItems = (stageKey: string) => {
    // Find deals in this stage (only valid deals)
    const stageDeals = filteredDeals.filter((deal: any) => {
      // Additional validation: ensure deal has required fields
      if (!deal || !deal.id || (!deal.title && !deal.name)) {
        return false;
      }
      // Match by stage key or stage name
      const dealStage = deal.stage || deal.stage_name?.toLowerCase() || '';
      const stageKeyLower = stageKey.toLowerCase();
      return dealStage === stageKeyLower || 
             dealStage.includes(stageKeyLower) ||
             stageKeyLower.includes(dealStage);
    });
    
    // Find leads in this stage - leads can be in any stage
    const targetStage = mappedStages.find(s => s.key === stageKey);
    const leadStage = mappedStages.find(s => s.key === 'lead'); // Get the "lead" stage for default assignment
    
    const stageLeads = filteredLeads.filter(lead => {
      // Get lead's stage info (check multiple possible fields)
      const leadStageId = (lead as any).stage_id || (lead as any).stage?.id;
      const leadStageName = (lead as any).stage_name || (lead as any).stage?.name;
      
      // If this is the "lead" stage column
      if (stageKey === 'lead') {
        // Show leads with no stage (default to "lead" stage)
        if (!leadStageId && !leadStageName) {
          return true;
        }
        
        // Show leads that match the "lead" stage ID
        if (leadStage?.id && leadStageId === leadStage.id) {
          return true;
        }
        
        // Show leads with stage name matching "lead"
        if (leadStageName) {
          const leadStageNameLower = leadStageName.toLowerCase().trim();
          if (leadStageNameLower.includes('lead') || leadStageNameLower === 'new') {
            return true;
          }
        }
      } else {
        // For other stages, only show leads that match this specific stage
        // Match by stage_id if available
        if (targetStage?.id && leadStageId === targetStage.id) {
          return true;
        }
        
        // Match by stage_name if available
        if (leadStageName && targetStage) {
          const leadStageNameLower = leadStageName.toLowerCase().trim();
          const targetStageName = targetStage.name?.toLowerCase().trim() || '';
          const stageKeyLower = stageKey.toLowerCase();
          
          // Check if stage names match exactly
          if (leadStageNameLower === targetStageName) {
            return true;
          }
          
          // Check if stage name contains the key or vice versa
          if (leadStageNameLower.includes(stageKeyLower) || stageKeyLower.includes(leadStageNameLower)) {
            return true;
          }
        }
      }
      
      return false;
    });
    
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
      const lead = allLeads.find(l => l.id === leadId);
      if (lead) {
        setDraggedItem({ type: 'lead', data: lead });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedItem(null);

    if (!over) {
      console.log('Drag ended with no drop target');
      return;
    }

    const itemId = active.id as string;
    const overId = over.id as string;
    
    console.log('Drag end:', { itemId, overId, over });
    
    // If dropped on the same item, do nothing
    if (itemId === overId) {
      console.log('Dropped on same item, ignoring');
      return;
    }
    
    // Get the target stage key
    // over.id could be:
    // 1. A stage key (e.g., 'lead', 'qualified') - when dropped directly on stage column
    // 2. Another item ID (e.g., 'lead-15', 'deal-16') - when dropped on another item
    let targetStageKey: string | null = null;
    
    // Check if dropped directly on a stage column (droppable)
    const isStageKey = mappedStages.some(s => s.key === overId);
    if (isStageKey) {
      console.log('Dropped directly on stage column:', overId);
      targetStageKey = overId;
    } else if (overId.startsWith('lead-') || overId.startsWith('deal-')) {
      // Dropped on another item - find the parent stage column
      // Use DOM to find which stage column contains this item
      console.log('Dropped on another item, finding parent stage:', overId);
      const allStageKeys = mappedStages.map(s => s.key);
      
      for (const stageKey of allStageKeys) {
        const stageColumn = document.querySelector(`[data-stage-key="${stageKey}"]`);
        if (stageColumn) {
          // Check if the item is inside this stage column
          // Items have IDs like 'lead-15' or 'deal-16'
          const itemElement = stageColumn.querySelector(`[id="${overId}"], [data-id="${overId}"]`);
          if (itemElement) {
            console.log('Found parent stage:', stageKey);
            targetStageKey = stageKey;
            break;
          }
        }
      }
      
      // If still not found, try to find by checking if the item's closest parent has data-stage-key
      if (!targetStageKey) {
        const itemElement = document.querySelector(`[id="${overId}"], [data-id="${overId}"]`);
        if (itemElement) {
          const parentStage = itemElement.closest('[data-stage-key]');
          if (parentStage) {
            targetStageKey = parentStage.getAttribute('data-stage-key');
            console.log('Found parent stage via closest:', targetStageKey);
          }
        }
      }
      
      // If still not found, ignore the drop
      if (!targetStageKey) {
        console.warn('Could not determine target stage. Item may have been dropped in invalid location.', {
          overId,
          itemId,
          availableStages: mappedStages.map(s => s.key)
        });
        toaster.create({
          title: 'Drop failed',
          description: 'Could not determine target stage. Please drop the item directly on a stage column.',
          type: 'error',
        });
        return;
      }
    } else {
      // Unknown drop target - try to find by DOM traversal
      console.log('Unknown drop target, trying DOM traversal:', overId);
      const element = document.querySelector(`[id="${overId}"], [data-id="${overId}"]`);
      if (element) {
        const parentStage = element.closest('[data-stage-key]');
        if (parentStage) {
          targetStageKey = parentStage.getAttribute('data-stage-key');
          console.log('Found stage via DOM traversal:', targetStageKey);
        }
      }
      
      if (!targetStageKey) {
      console.warn('Unknown drop target:', overId);
        toaster.create({
          title: 'Drop failed',
          description: 'Invalid drop location. Please drop the item on a stage column.',
          type: 'error',
        });
      return;
      }
    }

    // Find target stage by key
    const targetStage = mappedStages.find(s => s.key === targetStageKey);

    if (!targetStage) {
      toaster.create({
        title: 'Error',
        description: 'Target stage not found. Please drop the item directly on a stage column.',
        type: 'error',
      });
      return;
    }

    try {
      if (itemId.startsWith('deal-')) {
        // Move deal to new stage
        // For deals, we still need the stage ID, so try to resolve it
        let dealStageId = targetStage.id;
        
        // If no stage ID, try to find it
        if (!dealStageId) {
          const { findStageIdByName } = await import('@/utils/formTransformers');
          if (pipelineStages && pipelineStages.length > 0) {
            const stagesForLookup = pipelineStages.map(ps => ({ id: ps.id, name: ps.name }));
            dealStageId = findStageIdByName(targetStageKey, stagesForLookup) || 
                         findStageIdByName(targetStage.name, stagesForLookup);
          }
        }
        
        if (!dealStageId) {
          toaster.create({
            title: 'Error',
            description: 'Pipeline stage not found. Please ensure you have a pipeline configured.',
            type: 'error',
          });
          return;
        }
        
        const dealId = parseInt(itemId.replace('deal-', ''));
        await moveDealMutation.mutateAsync({ id: dealId, stageId: dealStageId });
        
        // Show success message
        if (targetStage.key === 'closed-won') {
          toaster.create({
            title: 'Deal won!',
            description: 'Deal marked as won. Customer will be created automatically.',
            type: 'success',
          });
        } else {
          toaster.create({
            title: 'Deal moved',
            description: `Deal moved to ${targetStage.name || targetStage.key} stage.`,
            type: 'success',
          });
        }
      } else if (itemId.startsWith('lead-')) {
        // Move lead to new stage (no conversion to deal)
        // Use the same handler that has all the stage ID resolution logic
        const leadId = parseInt(itemId.replace('lead-', ''));
        const lead = allLeads.find(l => l.id === leadId);
        
        if (!lead) {
          toaster.create({
            title: 'Error',
            description: 'Lead not found',
            type: 'error',
          });
          return;
        }

        // Use handleMoveLeadToStage which has all the stage ID resolution and error handling
        await handleMoveLeadToStage(lead, targetStageKey, targetStage.id);
      }
    } catch (error: any) {
      console.error('Error moving item:', error);
      // Only show error if it wasn't already shown by handleMoveLeadToStage
      if (!error.response || error.response.status !== 404) {
      toaster.create({
        title: 'Error',
        description: error.response?.data?.error || error.response?.data?.detail || 'Failed to move item. Please try again.',
        type: 'error',
      });
      }
    }
  };

  // Calculate stats - include both deals and leads
  const pipelineValue = useMemo(() => {
    const dealsValue = filteredDeals.reduce((sum, deal) => {
      const value = typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;
      return sum + (value || 0);
    }, 0);
    
    const leadsValue = filteredLeads.reduce((sum, lead) => {
      const estimatedValue = lead.estimated_value !== null && lead.estimated_value !== undefined
        ? (typeof lead.estimated_value === 'string' ? parseFloat(lead.estimated_value) : lead.estimated_value)
        : 0;
      return sum + (estimatedValue || 0);
    }, 0);
    
    return dealsValue + leadsValue;
  }, [filteredDeals, filteredLeads]);

  const openDeals = filteredDeals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost').length;
  const wonDeals = filteredDeals.filter(d => d.stage === 'closed-won').length;
  const wonValue = useMemo(() => {
    const wonDealsValue = filteredDeals
    .filter(d => d.stage === 'closed-won')
    .reduce((sum, deal) => {
      const value = typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value;
      return sum + (value || 0);
    }, 0);
    
    const wonLeadsValue = filteredLeads
      .filter(l => l.stage_name?.toLowerCase().includes('won') || l.stage_name?.toLowerCase().includes('closed-won'))
      .reduce((sum, lead) => {
        const estimatedValue = lead.estimated_value !== null && lead.estimated_value !== undefined
          ? (typeof lead.estimated_value === 'string' ? parseFloat(lead.estimated_value) : lead.estimated_value)
          : 0;
        return sum + (estimatedValue || 0);
      }, 0);
    
    return wonDealsValue + wonLeadsValue;
  }, [filteredDeals, filteredLeads]);

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
                  ...owners.filter((owner): owner is string => Boolean(owner)).map(owner => ({
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

              {/* Show New Lead button - vendors always have access, employees need permission */}
              {canCreateLead && (
                <Button
                  colorPalette="purple"
                  h="40px"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleOpenDialog();
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    // Prevent drag from starting
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  }}
                  disabled={permissionsLoading && !isVendor}
                  style={{ 
                    pointerEvents: 'auto', 
                    zIndex: 10, 
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  data-no-dnd="true"
                >
                  <FiPlus />
                  <Box ml={2}>New Lead</Box>
                </Button>
              )}
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
                        onLeadView={handleViewLead}
                        onLeadEdit={handleEditLead}
                        onLeadDelete={handleDeleteLead}
                        onLeadMoveToStage={handleMoveLeadToStage}
                        availableStages={mappedStages}
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
                  opacity={0.95}
                  transform="rotate(3deg)"
                >
                  <VStack align="stretch" gap={2}>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                      {(draggedItem.data as Deal).title}
                    </Text>
                    <HStack gap={2} fontSize="xs" color="gray.600">
                      <FiUser size={12} />
                      <Text>{(draggedItem.data as Deal).customer_name || 'No Customer'}</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold" color="purple.600">
                      {formatCurrency(
                        (() => {
                          const dealValue = (draggedItem.data as Deal).value;
                          if (typeof dealValue === 'string') {
                            return parseFloat(dealValue) || 0;
                          }
                          return typeof dealValue === 'number' ? dealValue : 0;
                        })()
                      )}
                    </Text>
                  </VStack>
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
                  opacity={0.95}
                  transform="rotate(3deg)"
                >
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between" align="start">
                      <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                        {(draggedItem.data as Lead).name || (draggedItem.data as Lead).organization_name || 'Unnamed Lead'}
                      </Text>
                      <Badge colorPalette="blue" size="sm">Lead</Badge>
                    </HStack>
                    {(draggedItem.data as Lead).email && (
                      <Text fontSize="xs" color="gray.600">
                        {(draggedItem.data as Lead).email}
                      </Text>
                    )}
                    {(() => {
                      const estValue = (draggedItem.data as Lead).estimated_value;
                      if (estValue === undefined || estValue === null) return null;
                      const numValue = typeof estValue === 'string' 
                        ? parseFloat(estValue) 
                        : (typeof estValue === 'number' ? estValue : 0);
                      if (numValue <= 0) return null;
                      return (
                        <Text fontSize="sm" fontWeight="bold" color="blue.600">
                          {formatCurrency(numValue)}
                        </Text>
                      );
                    })()}
                  </VStack>
                </Box>
              )
            ) : null}
          </DragOverlay>
        </VStack>
      </DndContext>
      
      {/* Create Lead Dialog - Outside DndContext to avoid conflicts */}
      <CreateLeadDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseDialog}
              onSubmit={(data: CreateLeadData) => {
                // Use activeOrganizationId from profile context (most reliable)
                // Fall back to data.organization only if activeOrganizationId is not available
                // Note: Backend will get organization from request context if not provided
                const organizationId = activeOrganizationId || data.organization;
                
                // Log for debugging
                console.log('🏢 Organization ID:', organizationId, 'from activeOrganizationId:', activeOrganizationId, 'from data:', data.organization);
                
                // Transform data - organization is optional, backend will get it from request context
                const transformedData = transformLeadFormData(data, organizationId);
                const backendData = cleanFormData(transformedData);
                
                console.log('📝 Submitting lead form:', data);
                console.log('🔄 Transformed data:', transformedData);
                console.log('✅ Final backend data:', backendData);
                
                createLead.mutate(backendData as CreateLeadData, {
                  onSuccess: () => {
                    toaster.create({
                      title: 'Lead created successfully',
                      description: 'The lead will appear in the Lead stage and can be dragged to other stages.',
                      type: 'success',
                    });
                    handleCloseDialog();
                    // Leads list will automatically refresh via React Query invalidation
                  },
                  onError: (err: any) => {
                    console.error('❌ Failed to create lead:', err);
                    console.error('❌ Full error object:', JSON.stringify(err, null, 2));
                    console.error('❌ Error response:', err.response?.data);
                    console.error('❌ Error errors:', err.errors);
                    console.error('❌ Error message:', err.message);
                    console.error('❌ Error status:', err.status);
                    
                    // Handle both transformed error format (from apiClient) and original axios error format
                    // The apiClient transforms errors to { message, status, errors }
                    // But we also need to check the original response data
                    const originalErrorData = err.response?.data || {};
                    const transformedErrors = err.errors || {};
                    const errorData = { ...originalErrorData, ...transformedErrors };
                    
                    // Extract error message from various possible formats
                    // Priority: detail field (DRF ValidationError) > transformed message > field errors > message > error
                    let errorMessage = 'Failed to create lead. Please try again.';
                    
                    // First check the transformed message (from apiClient)
                    if (err.message && err.message !== 'An error occurred') {
                      errorMessage = err.message;
                    }
                    
                    // Check for detail field (common in DRF ValidationError, including PermissionDenied wrapped as ValidationError)
                    if (errorData.detail) {
                      errorMessage = typeof errorData.detail === 'string' 
                        ? errorData.detail 
                        : (Array.isArray(errorData.detail) ? errorData.detail[0] : String(errorData.detail));
                    } else if (errorData && typeof errorData === 'object') {
                      // Check for field-specific errors (array format)
                      const fieldErrors = [
                        errorData.organization?.[0], // Check organization errors first
                        errorData.email?.[0],
                        errorData.phone?.[0],
                        errorData.name?.[0],
                        errorData.organization_name?.[0],
                        errorData.lead_score?.[0],
                        errorData.estimated_value?.[0],
                        errorData.non_field_errors?.[0],
                      ].filter(Boolean);
                      
                      if (fieldErrors.length > 0) {
                        errorMessage = fieldErrors[0];
                      } else if (errorData.message && errorData.message !== 'An error occurred') {
                        errorMessage = errorData.message;
                      } else if (errorData.error) {
                        errorMessage = errorData.error;
                      }
                    }
                    
                    // Check if it's a permission error and provide helpful message
                    if (errorMessage.includes('Permission denied') || errorMessage.includes('lead:create') || errorMessage.includes('Failed to create lead: Permission denied')) {
                      errorMessage = 'You do not have permission to create leads. Please contact your administrator to grant you the "lead:create" permission.';
                    }
                    
                    toaster.create({
                      title: 'Failed to create lead',
                      description: errorMessage,
                      type: 'error',
                    });
                  },
                });
              }}
        isLoading={createLead.isPending}
      />
    </DashboardLayout>
  );
};

export default SalesPage;
