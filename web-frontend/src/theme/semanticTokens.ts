/**
 * Semantic Tokens - Context-specific token mappings
 * Maps design tokens to semantic purposes
 */
import { designTokens } from './tokens';

export const semanticTokens = {
  // ============================================
  // CUSTOMER STATUS COLORS
  // ============================================
  customerStatus: {
    active: {
      bg: '#DCFCE7',        // Green 100
      color: '#15803D',     // Green 700
      border: '#BBF7D0',    // Green 200
    },
    prospect: {
      bg: '#FEF3C7',        // Yellow 100
      color: '#B45309',     // Yellow 700
      border: '#FDE68A',    // Yellow 200
    },
    inactive: {
      bg: '#F3F4F6',        // Gray 100
      color: '#4B5563',     // Gray 600
      border: '#E5E7EB',    // Gray 200
    },
    vip: {
      bg: '#FCE7F3',        // Pink 100
      color: '#BE185D',     // Pink 700
      border: '#FBCFE8',    // Pink 200
    },
  },

  // ============================================
  // DEAL STAGE COLORS
  // ============================================
  dealStage: {
    lead: {
      bg: '#DBEAFE',        // Blue 100
      color: '#1D4ED8',     // Blue 700
      border: '#BFDBFE',    // Blue 200
    },
    qualified: {
      bg: '#EDE9FE',        // Purple 100
      color: '#6D28D9',     // Purple 700
      border: '#DDD6FE',    // Purple 200
    },
    proposal: {
      bg: '#E0F2FE',        // Sky 100
      color: '#0369A1',     // Sky 700
      border: '#BAE6FD',    // Sky 200
    },
    negotiation: {
      bg: '#FEF3C7',        // Yellow 100
      color: '#B45309',     // Yellow 700
      border: '#FDE68A',    // Yellow 200
    },
    'closed-won': {
      bg: '#DCFCE7',        // Green 100
      color: '#15803D',     // Green 700
      border: '#BBF7D0',    // Green 200
    },
    'closed-lost': {
      bg: '#FEE2E2',        // Red 100
      color: '#B91C1C',     // Red 700
      border: '#FECACA',    // Red 200
    },
  },

  // ============================================
  // STATS CARD COLORS
  // ============================================
  statsCard: {
    customers: {
      iconBg: '#EDE9FE',    // Purple 100
      iconColor: '#7C3AED', // Purple 600
    },
    deals: {
      iconBg: '#DBEAFE',    // Blue 100
      iconColor: '#2563EB', // Blue 600
    },
    revenue: {
      iconBg: '#DCFCE7',    // Green 100
      iconColor: '#16A34A', // Green 600
    },
    conversion: {
      iconBg: '#FEF3C7',    // Yellow 100
      iconColor: '#D97706', // Yellow 600
    },
  },

  // ============================================
  // ACTION COLORS
  // ============================================
  actions: {
    primary: {
      bg: '#8B5CF6',           // Purple 500
      bgHover: '#7C3AED',      // Purple 600
      bgActive: '#6D28D9',     // Purple 700
      color: '#FFFFFF',
    },
    secondary: {
      bg: '#3B82F6',           // Blue 500
      bgHover: '#2563EB',      // Blue 600
      bgActive: '#1D4ED8',     // Blue 700
      color: '#FFFFFF',
    },
    success: {
      bg: '#22C55E',           // Green 500
      bgHover: '#16A34A',      // Green 600
      bgActive: '#15803D',     // Green 700
      color: '#FFFFFF',
    },
    danger: {
      bg: '#EF4444',           // Red 500
      bgHover: '#DC2626',      // Red 600
      bgActive: '#B91C1C',     // Red 700
      color: '#FFFFFF',
    },
    ghost: {
      bg: 'transparent',
      bgHover: '#F3F4F6',      // Gray 100
      bgActive: '#E5E7EB',     // Gray 200
      color: '#6B7280',        // Gray 500
    },
  },

  // ============================================
  // FORM ELEMENTS
  // ============================================
  forms: {
    input: {
      bg: '#FFFFFF',
      border: '#E5E7EB',
      borderFocus: '#8B5CF6',
      placeholder: '#9CA3AF',
      text: '#111827',
      disabled: {
        bg: '#F9FAFB',
        text: '#9CA3AF',
      },
    },
    select: {
      bg: '#FFFFFF',
      border: '#E5E7EB',
      borderFocus: '#8B5CF6',
      text: '#111827',
      option: {
        bg: '#FFFFFF',
        bgHover: '#F3F4F6',
        bgSelected: '#F5F3FF',
        text: '#111827',
        textSelected: '#6D28D9',
      },
    },
    checkbox: {
      border: '#E5E7EB',
      bg: '#FFFFFF',
      bgChecked: '#8B5CF6',
      checkColor: '#FFFFFF',
    },
  },

  // ============================================
  // FEEDBACK
  // ============================================
  feedback: {
    success: {
      bg: '#DCFCE7',
      border: '#BBF7D0',
      text: '#15803D',
      icon: '#22C55E',
    },
    error: {
      bg: '#FEE2E2',
      border: '#FECACA',
      text: '#B91C1C',
      icon: '#EF4444',
    },
    warning: {
      bg: '#FEF3C7',
      border: '#FDE68A',
      text: '#B45309',
      icon: '#F59E0B',
    },
    info: {
      bg: '#DBEAFE',
      border: '#BFDBFE',
      text: '#1D4ED8',
      icon: '#3B82F6',
    },
  },

  // ============================================
  // NAVIGATION
  // ============================================
  navigation: {
    sidebar: {
      bg: '#FFFFFF',
      border: '#E5E7EB',
      item: {
        color: '#6B7280',
        colorActive: '#8B5CF6',
        bgHover: '#F9FAFB',
        bgActive: '#F5F3FF',
      },
    },
    header: {
      bg: '#FFFFFF',
      border: '#E5E7EB',
      text: '#111827',
    },
  },

  // ============================================
  // DATA DISPLAY
  // ============================================
  dataDisplay: {
    table: {
      headerBg: '#F9FAFB',
      headerText: '#6B7280',
      rowBorder: '#E5E7EB',
      rowBgHover: '#F9FAFB',
      cellText: '#111827',
      cellTextSecondary: '#6B7280',
    },
    card: {
      bg: '#FFFFFF',
      border: '#E5E7EB',
      shadow: designTokens.shadows.sm,
      title: '#111827',
      description: '#6B7280',
    },
    badge: {
      default: {
        bg: '#F3F4F6',
        color: '#4B5563',
      },
      primary: {
        bg: '#EDE9FE',
        color: '#6D28D9',
      },
      secondary: {
        bg: '#DBEAFE',
        color: '#1D4ED8',
      },
      success: {
        bg: '#DCFCE7',
        color: '#15803D',
      },
      warning: {
        bg: '#FEF3C7',
        color: '#B45309',
      },
      error: {
        bg: '#FEE2E2',
        color: '#B91C1C',
      },
    },
  },

  // ============================================
  // OVERLAYS
  // ============================================
  overlays: {
    modal: {
      overlay: 'rgba(0, 0, 0, 0.5)',
      bg: '#FFFFFF',
      shadow: designTokens.shadows.xl,
    },
    dropdown: {
      bg: '#FFFFFF',
      border: '#E5E7EB',
      shadow: designTokens.shadows.lg,
    },
    tooltip: {
      bg: '#1F2937',
      text: '#FFFFFF',
      shadow: designTokens.shadows.md,
    },
  },

  // ============================================
  // EMPTY STATES
  // ============================================
  emptyState: {
    bg: '#F9FAFB',
    border: '#E5E7EB',
    icon: '#9CA3AF',
    title: '#111827',
    description: '#6B7280',
  },
} as const;

export type SemanticTokens = typeof semanticTokens;
