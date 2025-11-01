/**
 * Design Tokens for Too Good CRM
 * Centralized design system values
 */

export const designTokens = {
  // ============================================
  // COLORS
  // ============================================
  colors: {
    // Brand Colors
    brand: {
      primary: {
        50: '#F5F3FF',
        100: '#EDE9FE',
        200: '#DDD6FE',
        300: '#C4B5FD',
        400: '#A78BFA',
        500: '#8B5CF6',  // Main purple
        600: '#7C3AED',
        700: '#6D28D9',
        800: '#5B21B6',
        900: '#4C1D95',
      },
      secondary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',  // Main blue
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
      },
    },

    // Semantic Colors
    semantic: {
      success: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        200: '#BBF7D0',
        300: '#86EFAC',
        400: '#4ADE80',
        500: '#22C55E',
        600: '#16A34A',
        700: '#15803D',
        800: '#166534',
        900: '#14532D',
      },
      warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
      },
      error: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
      },
      info: {
        50: '#F0F9FF',
        100: '#E0F2FE',
        200: '#BAE6FD',
        300: '#7DD3FC',
        400: '#38BDF8',
        500: '#0EA5E9',
        600: '#0284C7',
        700: '#0369A1',
        800: '#075985',
        900: '#0C4A6E',
      },
    },

    // Neutral Colors
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },

    // Gray Scale (from your theme)
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Status Colors (CRM specific)
    status: {
      active: '#22C55E',      // Green
      pending: '#F59E0B',     // Orange
      inactive: '#6B7280',    // Gray
      lead: '#60A5FA',        // Light Blue
      qualified: '#8B5CF6',   // Purple
      won: '#22C55E',         // Green
      lost: '#EF4444',        // Red
    },

    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      dark: '#111827',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Border Colors
    border: {
      light: '#E5E7EB',
      medium: '#D1D5DB',
      dark: '#9CA3AF',
      focus: '#8B5CF6',
    },

    // Text Colors
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
      link: '#8B5CF6',
      linkHover: '#7C3AED',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    // Font Families
    fonts: {
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },

    // Font Sizes
    fontSizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      md: '1rem',         // 16px (base)
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
    },

    // Font Weights
    fontWeights: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    // Line Heights
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    // Letter Spacing
    letterSpacings: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  // ============================================
  // SIZING
  // ============================================
  sizes: {
    // Component Sizes
    input: {
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px',
    },
    button: {
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px',
    },
    icon: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '32px',
    },
    avatar: {
      xs: '24px',
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '64px',
      '2xl': '96px',
    },

    // Container Sizes
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    // Max Widths
    maxWidth: {
      xs: '20rem',    // 320px
      sm: '24rem',    // 384px
      md: '28rem',    // 448px
      lg: '32rem',    // 512px
      xl: '36rem',    // 576px
      '2xl': '42rem', // 672px
      '3xl': '48rem', // 768px
      '4xl': '56rem', // 896px
      '5xl': '64rem', // 1024px
      '6xl': '72rem', // 1152px
      '7xl': '80rem', // 1280px
      full: '100%',
    },
  },

  // ============================================
  // BORDERS
  // ============================================
  borders: {
    // Border Widths
    borderWidths: {
      none: '0',
      thin: '1px',
      medium: '2px',
      thick: '4px',
    },

    // Border Radius
    radii: {
      none: '0',
      sm: '0.125rem',   // 2px
      base: '0.25rem',  // 4px
      md: '0.375rem',   // 6px
      lg: '0.5rem',     // 8px
      xl: '0.75rem',    // 12px
      '2xl': '1rem',    // 16px
      '3xl': '1.5rem',  // 24px
      full: '9999px',
    },
  },

  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    none: 'none',
    // Focus shadows
    focus: '0 0 0 3px rgba(139, 92, 246, 0.5)',
    focusBlue: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  },

  // ============================================
  // TRANSITIONS
  // ============================================
  transitions: {
    // Duration
    duration: {
      fastest: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
      slowest: '700ms',
    },

    // Easing
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },

    // Property
    property: {
      common: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      colors: 'background-color, border-color, color, fill, stroke',
      dimensions: 'width, height',
      position: 'left, right, top, bottom',
      background: 'background-color, background-image, background-position',
    },
  },

  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ============================================
  // COMPONENT-SPECIFIC TOKENS
  // ============================================
  components: {
    // Input
    input: {
      height: '40px',
      padding: '0 12px',
      fontSize: '0.875rem',
      borderRadius: '0.375rem',
      borderColor: '#E5E7EB',
      focusBorderColor: '#8B5CF6',
      placeholderColor: '#9CA3AF',
    },

    // Button
    button: {
      height: '40px',
      padding: '0 16px',
      fontSize: '0.875rem',
      fontWeight: 500,
      borderRadius: '0.375rem',
      transition: 'all 200ms ease-in-out',
    },

    // Card
    card: {
      padding: '24px',
      borderRadius: '0.75rem',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },

    // Table
    table: {
      headerBg: '#F9FAFB',
      headerColor: '#6B7280',
      headerFontSize: '0.75rem',
      headerFontWeight: 600,
      rowBorderColor: '#E5E7EB',
      rowHoverBg: '#F9FAFB',
      cellPadding: '12px 16px',
    },

    // Badge
    badge: {
      padding: '4px 12px',
      fontSize: '0.75rem',
      fontWeight: 500,
      borderRadius: '9999px',
    },

    // Modal
    modal: {
      overlayBg: 'rgba(0, 0, 0, 0.5)',
      contentBg: '#FFFFFF',
      contentPadding: '24px',
      contentRadius: '0.75rem',
      maxWidth: '500px',
    },

    // Dropdown/Select
    select: {
      height: '40px',
      padding: '0 32px 0 12px',
      fontSize: '0.875rem',
      borderRadius: '0.375rem',
      borderColor: '#E5E7EB',
      focusBorderColor: '#8B5CF6',
      optionPadding: '8px 12px',
      optionHoverBg: '#F3F4F6',
      selectedBg: '#F5F3FF',
    },
  },

  // ============================================
  // LAYOUT
  // ============================================
  layout: {
    // Page padding
    pagePadding: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px',
    },

    // Section spacing
    sectionGap: {
      sm: '24px',
      md: '32px',
      lg: '48px',
      xl: '64px',
    },

    // Grid gaps
    gridGap: {
      sm: '12px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },

    // Sidebar
    sidebar: {
      width: '280px',
      collapsedWidth: '80px',
    },

    // Header
    header: {
      height: '64px',
      padding: '0 24px',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;
