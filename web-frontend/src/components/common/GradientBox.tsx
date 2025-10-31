import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';

interface GradientBoxProps extends BoxProps {
  variant?: 'purple-blue' | 'blue-teal' | 'pink-orange';
}

const GradientBox = ({ variant = 'purple-blue', children, ...props }: GradientBoxProps) => {
  const gradients = {
    'purple-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'blue-teal': 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
    'pink-orange': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  };

  return (
    <Box
      bg={gradients[variant]}
      borderRadius="2xl"
      boxShadow="xl"
      p={8}
      color="white"
      {...props}
    >
      {children}
    </Box>
  );
};

export default GradientBox;
