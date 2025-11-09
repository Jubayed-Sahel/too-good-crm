/**
 * Design Constants for Consistent UI
 * Standardized values for spacing, sizing, and styling patterns
 */

export const DESIGN_CONSTANTS = {
  // Page Layout
  PAGE: {
    PADDING_X: { base: 4, md: 5, lg: 6 },
    PADDING_Y: { base: 4, md: 5 },
    MAX_WIDTH: '1600px',
    GAP: 5, // Standard gap between page sections
  },

  // Card Styling
  CARD: {
    PADDING: { base: 5, md: 6 },
    BORDER_RADIUS: 'xl',
    SHADOW: 'sm',
    BORDER: '1px',
    BORDER_COLOR: 'gray.200',
    BG: 'white',
    HOVER: {
      SHADOW: 'md',
      TRANSFORM: 'translateY(-2px)',
    },
  },

  // Page Header
  PAGE_HEADER: {
    GAP: 4,
    PADDING_BOTTOM: 4,
    BORDER_BOTTOM: '1px',
    BORDER_COLOR: 'gray.200',
    MARGIN_BOTTOM: 6,
  },

  // Section Spacing
  SECTION: {
    GAP: 5,
    MARGIN_BOTTOM: 6,
  },

  // Button Styles
  BUTTON: {
    PRIMARY: {
      BG: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      COLOR: 'white',
      HOVER: {
        TRANSFORM: 'translateY(-2px)',
        SHADOW: '0 10px 20px rgba(102, 126, 234, 0.3)',
      },
    },
    SECONDARY: {
      BG: 'white',
      COLOR: 'purple.600',
      BORDER: '1px',
      BORDER_COLOR: 'gray.200',
      HOVER: {
        BG: 'gray.50',
        BORDER_COLOR: 'gray.300',
      },
    },
    DANGER: {
      BG: 'red.500',
      COLOR: 'white',
      HOVER: {
        BG: 'red.600',
        TRANSFORM: 'translateY(-2px)',
        SHADOW: '0 10px 20px rgba(239, 68, 68, 0.3)',
      },
    },
  },

  // Input Styles
  INPUT: {
    HEIGHT: '12',
    BORDER_RADIUS: 'lg',
    FOCUS: {
      BORDER_COLOR: 'purple.500',
      SHADOW: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    },
  },

  // Table Styles
  TABLE: {
    HEADER_BG: 'gray.50',
    HEADER_COLOR: 'gray.700',
    ROW_HOVER: 'gray.50',
    BORDER_COLOR: 'gray.200',
  },

  // Badge Styles
  BADGE: {
    RADIUS: 'full',
    PADDING_X: 3,
    PADDING_Y: 1,
    FONT_SIZE: 'xs',
    FONT_WEIGHT: 'medium',
  },

  // Typography
  TYPOGRAPHY: {
    HEADING: {
      COLOR: 'gray.800',
      WEIGHT: 'bold',
    },
    BODY: {
      COLOR: 'gray.600',
      SIZE: 'md',
    },
    CAPTION: {
      COLOR: 'gray.500',
      SIZE: 'sm',
    },
  },

  // Spacing Scale (consistent gaps)
  SPACING: {
    XS: 2,
    SM: 3,
    MD: 4,
    LG: 5,
    XL: 6,
    '2XL': 8,
  },

  // Grid
  GRID: {
    GAP: 5,
    COLUMNS: {
      BASE: 1,
      MD: 2,
      LG: 3,
      XL: 4,
    },
  },
} as const;

export type DesignConstants = typeof DESIGN_CONSTANTS;

