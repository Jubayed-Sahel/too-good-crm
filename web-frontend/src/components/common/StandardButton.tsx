import { Button } from '@chakra-ui/react';
import { DESIGN_CONSTANTS } from '@/config/design.constants';
import type { ReactNode, ComponentProps } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

interface StandardButtonProps extends Omit<ButtonProps, 'colorPalette'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const StandardButton = ({
  variant = 'primary',
  children,
  ...props
}: StandardButtonProps) => {
  const variantStyles = {
    primary: {
      bg: DESIGN_CONSTANTS.BUTTON.PRIMARY.BG,
      color: DESIGN_CONSTANTS.BUTTON.PRIMARY.COLOR,
      _hover: DESIGN_CONSTANTS.BUTTON.PRIMARY.HOVER,
      fontWeight: 'bold',
    },
    secondary: {
      bg: DESIGN_CONSTANTS.BUTTON.SECONDARY.BG,
      color: DESIGN_CONSTANTS.BUTTON.SECONDARY.COLOR,
      border: DESIGN_CONSTANTS.BUTTON.SECONDARY.BORDER,
      borderColor: DESIGN_CONSTANTS.BUTTON.SECONDARY.BORDER_COLOR,
      _hover: DESIGN_CONSTANTS.BUTTON.SECONDARY.HOVER,
    },
    outline: {
      variant: 'outline' as const,
      borderColor: 'gray.300',
      color: 'gray.700',
      _hover: {
        bg: 'gray.50',
        borderColor: 'gray.400',
      },
    },
    ghost: {
      variant: 'ghost' as const,
      color: 'gray.700',
      _hover: {
        bg: 'gray.100',
      },
    },
    danger: {
      bg: DESIGN_CONSTANTS.BUTTON.DANGER.BG,
      color: DESIGN_CONSTANTS.BUTTON.DANGER.COLOR,
      _hover: {
        bg: DESIGN_CONSTANTS.BUTTON.DANGER.HOVER.BG || 'red.600',
        transform: DESIGN_CONSTANTS.BUTTON.DANGER.HOVER.TRANSFORM,
        boxShadow: DESIGN_CONSTANTS.BUTTON.DANGER.HOVER.SHADOW,
      },
      fontWeight: 'bold',
    },
  };

  return (
    <Button
      {...variantStyles[variant]}
      transition="all 0.2s"
      leftIcon={props.leftIcon}
      rightIcon={props.rightIcon}
      {...props}
    >
      {children}
    </Button>
  );
};

export default StandardButton;

