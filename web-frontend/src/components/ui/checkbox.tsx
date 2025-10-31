"use client"

import { Checkbox as ChakraCheckbox } from "@chakra-ui/react"
import type { CheckboxRootProps } from "@chakra-ui/react"
import type { ReactNode } from "react"

export interface CheckboxProps extends CheckboxRootProps {
  children?: ReactNode
  checked?: boolean
  onCheckedChange?: (details: { checked: boolean | "indeterminate" }) => void
}

export const Checkbox = ({ children, checked, onCheckedChange, ...props }: CheckboxProps) => {
  return (
    <ChakraCheckbox.Root checked={checked} onCheckedChange={onCheckedChange} {...props}>
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control />
      {children && (
        <ChakraCheckbox.Label>{children}</ChakraCheckbox.Label>
      )}
    </ChakraCheckbox.Root>
  )
}
