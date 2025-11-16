"use client"

import { RadioGroup as ChakraRadioGroup } from "@chakra-ui/react"
import type { RadioGroupRootProps } from "@chakra-ui/react"
import * as React from "react"

export interface RadioGroupProps extends RadioGroupRootProps {
  children?: React.ReactNode
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(props, ref) {
    const { children, ...rest } = props
    return (
      <ChakraRadioGroup.Root ref={ref} {...rest}>
        {children}
      </ChakraRadioGroup.Root>
    )
  },
)

export interface RadioProps extends ChakraRadioGroup.ItemProps {
  children?: React.ReactNode
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio(props, ref) {
    const { children, inputProps, ...rest } = props
    return (
      <ChakraRadioGroup.Item {...rest}>
        <ChakraRadioGroup.ItemHiddenInput ref={ref} {...inputProps} />
        <ChakraRadioGroup.ItemControl />
        {children && (
          <ChakraRadioGroup.ItemText>{children}</ChakraRadioGroup.ItemText>
        )}
      </ChakraRadioGroup.Item>
    )
  },
)

