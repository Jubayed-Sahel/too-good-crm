import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { DESIGN_CONSTANTS } from '@/config/design.constants';

// CSS keyframes as strings (Chakra UI v3 doesn't export keyframes)
const fadeInKeyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject keyframes into document
if (typeof document !== 'undefined') {
  const styleId = 'standard-card-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = fadeInKeyframes;
    document.head.appendChild(style);
  }
}

interface StandardCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  hover?: boolean;
  loading?: boolean;
  padding?: number | object;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const StandardCard = ({
  children,
  title,
  description,
  actions,
  hover = false,
  loading = false,
  padding,
  variant = 'default',
}: StandardCardProps) => {
  const variantStyles = {
    default: {
      shadow: DESIGN_CONSTANTS.CARD.SHADOW,
      border: DESIGN_CONSTANTS.CARD.BORDER,
      borderColor: DESIGN_CONSTANTS.CARD.BORDER_COLOR,
    },
    elevated: {
      shadow: 'md',
      border: 'none',
    },
    outlined: {
      shadow: 'none',
      border: DESIGN_CONSTANTS.CARD.BORDER,
      borderColor: DESIGN_CONSTANTS.CARD.BORDER_COLOR,
    },
  };

  const styles = variantStyles[variant];

  if (loading) {
    return (
      <Box
        bg={DESIGN_CONSTANTS.CARD.BG}
        borderRadius={DESIGN_CONSTANTS.CARD.BORDER_RADIUS}
        p={padding || DESIGN_CONSTANTS.CARD.PADDING}
        {...styles}
        minH="200px"
      />
    );
  }

  return (
    <Box
      bg={DESIGN_CONSTANTS.CARD.BG}
      borderRadius={DESIGN_CONSTANTS.CARD.BORDER_RADIUS}
      p={padding || DESIGN_CONSTANTS.CARD.PADDING}
      {...styles}
      transition="all 0.2s ease-in-out"
      animation="fadeIn 0.3s ease-out"
      _hover={
        hover
          ? {
              ...DESIGN_CONSTANTS.CARD.HOVER,
              cursor: 'pointer',
            }
          : undefined
      }
    >
      {(title || description || actions) && (
        <Box
          mb={4}
          pb={4}
          borderBottom={title || description || actions ? '1px' : 'none'}
          borderColor="gray.200"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="start"
            gap={4}
            flexDirection={{ base: 'column', md: 'row' }}
          >
            <Box flex={1}>
              {title && (
                <Box
                  as="h3"
                  fontSize="lg"
                  fontWeight="semibold"
                  color={DESIGN_CONSTANTS.TYPOGRAPHY.HEADING.COLOR}
                  mb={description ? 2 : 0}
                >
                  {title}
                </Box>
              )}
              {description && (
                <Box
                  as="p"
                  fontSize="sm"
                  color={DESIGN_CONSTANTS.TYPOGRAPHY.BODY.COLOR}
                >
                  {description}
                </Box>
              )}
            </Box>
            {actions && <Box>{actions}</Box>}
          </Box>
        </Box>
      )}
      {children}
    </Box>
  );
};

export default StandardCard;

