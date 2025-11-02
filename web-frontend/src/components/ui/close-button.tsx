import { IconButton } from "@chakra-ui/react"
import { forwardRef } from "react"
import { FiX } from "react-icons/fi"

export interface CloseButtonProps {
  size?: 'xs' | '2xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children?: React.ReactNode;
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton(props, ref) {
    return (
      <IconButton variant="ghost" aria-label="Close" ref={ref} {...props}>
        {props.children ?? <FiX />}
      </IconButton>
    )
  },
)
