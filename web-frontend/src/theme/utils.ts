/**
 * Theme Utility Functions
 * Helper functions for using design tokens
 */
import { designTokens } from './tokens';
import { semanticTokens } from './semanticTokens';
import type { CustomerStatus, DealStage } from '@/types';

/**
 * Get customer status badge colors
 */
export const getCustomerStatusColors = (status: CustomerStatus) => {
  const statusMap = {
    active: semanticTokens.customerStatus.active,
    pending: semanticTokens.customerStatus.pending,
    inactive: semanticTokens.customerStatus.inactive,
  };
  
  return statusMap[status] || semanticTokens.customerStatus.inactive;
};

/**
 * Get deal stage badge colors
 */
export const getDealStageColors = (stage: DealStage) => {
  const stageMap = {
    lead: semanticTokens.dealStage.lead,
    qualified: semanticTokens.dealStage.qualified,
    proposal: semanticTokens.dealStage.proposal,
    negotiation: semanticTokens.dealStage.negotiation,
    'closed-won': semanticTokens.dealStage['closed-won'],
    'closed-lost': semanticTokens.dealStage['closed-lost'],
  };
  
  return stageMap[stage] || semanticTokens.dealStage.lead;
};

/**
 * Get stats card icon colors
 */
export const getStatsCardColors = (type: 'customers' | 'deals' | 'revenue' | 'conversion') => {
  return semanticTokens.statsCard[type];
};

/**
 * Get action button colors
 */
export const getActionColors = (variant: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost') => {
  return semanticTokens.actions[variant];
};

/**
 * Format customer status label
 */
export const formatCustomerStatus = (status: CustomerStatus): string => {
  const statusLabels = {
    active: 'Active',
    pending: 'Pending',
    inactive: 'Inactive',
  };
  
  return statusLabels[status] || status;
};

/**
 * Format deal stage label
 */
export const formatDealStage = (stage: DealStage): string => {
  const stageLabels = {
    lead: 'Lead',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    'closed-won': 'Closed Won',
    'closed-lost': 'Closed Lost',
  };
  
  return stageLabels[stage] || stage;
};

/**
 * Get responsive spacing
 */
export const getResponsiveSpacing = (
  mobile: keyof typeof designTokens.spacing,
  tablet?: keyof typeof designTokens.spacing,
  desktop?: keyof typeof designTokens.spacing
) => {
  return {
    base: designTokens.spacing[mobile],
    md: designTokens.spacing[tablet || mobile],
    lg: designTokens.spacing[desktop || tablet || mobile],
  };
};

/**
 * Get transition styles
 */
export const getTransition = (
  property: keyof typeof designTokens.transitions.property = 'common',
  duration: keyof typeof designTokens.transitions.duration = 'normal',
  easing: keyof typeof designTokens.transitions.easing = 'easeInOut'
) => {
  return {
    transitionProperty: designTokens.transitions.property[property],
    transitionDuration: designTokens.transitions.duration[duration],
    transitionTimingFunction: designTokens.transitions.easing[easing],
  };
};
