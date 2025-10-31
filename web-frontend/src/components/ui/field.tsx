"use client"

import { Field as ChakraField } from "@chakra-ui/react"
import type { HTMLChakraProps } from "@chakra-ui/react"
import type { ReactElement } from "react"

export interface FieldProps extends HTMLChakraProps<"div"> {
  label?: React.ReactNode
  helperText?: React.ReactNode
  errorText?: React.ReactNode
  optionalText?: React.ReactNode
  children: ReactElement
  required?: boolean
  invalid?: boolean
  readOnly?: boolean
  disabled?: boolean
}

export const Field = ({
  label,
  children,
  helperText,
  errorText,
  optionalText,
  required,
  invalid,
  readOnly,
  disabled,
  ...props
}: FieldProps) => {
  return (
    <ChakraField.Root required={required} invalid={invalid} readOnly={readOnly} disabled={disabled} {...props}>
      {label && (
        <ChakraField.Label>
          {label}
          {optionalText && <ChakraField.RequiredIndicator fallback={optionalText} />}
        </ChakraField.Label>
      )}
      {children}
      {helperText && (
        <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
      )}
      {errorText && (
        <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  )
}
