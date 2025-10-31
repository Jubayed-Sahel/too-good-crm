import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';

interface CardProps extends BoxProps {
  variant?: 'elevated' | 'outline' | 'subtle';
}

const Card = ({ variant = 'elevated', children, ...props }: CardProps) => {
  const variants = {
    elevated: {
      bg: 'white',
      boxShadow: 'md',
      border: '1px',
      borderColor: 'gray.100',
      _hover: { boxShadow: 'lg' },
    },
    outline: {
      bg: 'white',
      border: '2px',
      borderColor: 'gray.200',
      _hover: { borderColor: 'purple.500' },
    },
    subtle: {
      bg: 'gray.50',
      border: '1px',
      borderColor: 'gray.100',
    },
  };

  return (
    <Box
      borderRadius="xl"
      p={6}
      transition="all 0.2s"
      {...variants[variant]}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Card;
