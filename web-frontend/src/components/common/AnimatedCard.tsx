import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

// CSS keyframes as strings
const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

// Inject keyframes into document
if (typeof document !== 'undefined') {
  const styleId = 'animated-card-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = fadeInUpKeyframes + shimmerKeyframes;
    document.head.appendChild(style);
  }
}

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  hoverEffect?: boolean;
  loading?: boolean;
}

export const AnimatedCard = ({ 
  children, 
  delay = 0, 
  hoverEffect = true,
  loading = false 
}: AnimatedCardProps) => {
  if (loading) {
    return (
      <Box
        bg="gray.100"
        borderRadius="xl"
        p={6}
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: "-1000px",
          width: "2000px",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
          animation: "shimmer 2s infinite",
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="md"
      p={6}
      borderWidth="1px"
      borderColor="gray.100"
      animation={`fadeInUp 0.5s ease-out ${delay}s both`}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={hoverEffect ? {
        transform: "translateY(-4px)",
        boxShadow: "xl",
        borderColor: "purple.200",
      } : undefined}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
        opacity: 0,
        transition: "opacity 0.3s",
      }}
      _hover={{
        ...( hoverEffect && {
          _before: {
            opacity: 1,
          }
        })
      }}
    >
      {children}
    </Box>
  );
};

export default AnimatedCard;

