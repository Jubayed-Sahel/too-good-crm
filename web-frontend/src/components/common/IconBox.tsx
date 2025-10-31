import { Flex } from '@chakra-ui/react';
import type { FlexProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface IconBoxProps extends FlexProps {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'purple' | 'blue' | 'green' | 'red' | 'orange';
}

const IconBox = ({ icon, size = 'md', colorScheme = 'purple', ...props }: IconBoxProps) => {
  const sizes = {
    sm: { w: '8', h: '8' },
    md: { w: '10', h: '10' },
    lg: { w: '12', h: '12' },
  };

  const colorSchemes = {
    purple: { bg: 'purple.100', color: 'purple.600' },
    blue: { bg: 'blue.100', color: 'blue.600' },
    green: { bg: 'green.100', color: 'green.600' },
    red: { bg: 'red.100', color: 'red.600' },
    orange: { bg: 'orange.100', color: 'orange.600' },
  };

  return (
    <Flex
      {...sizes[size]}
      bg={colorSchemes[colorScheme].bg}
      color={colorSchemes[colorScheme].color}
      borderRadius="lg"
      align="center"
      justify="center"
      {...props}
    >
      {icon}
    </Flex>
  );
};

export default IconBox;
