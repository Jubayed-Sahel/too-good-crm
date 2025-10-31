import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e3f2fd' },
          100: { value: '#bbdefb' },
          200: { value: '#90caf9' },
          300: { value: '#64b5f6' },
          400: { value: '#42a5f5' },
          500: { value: '#2196f3' },
          600: { value: '#1e88e5' },
          700: { value: '#1976d2' },
          800: { value: '#1565c0' },
          900: { value: '#0d47a1' },
        },
      },
      fonts: {
        heading: { value: `'Inter', sans-serif` },
        body: { value: `'Inter', sans-serif` },
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg': { value: '{colors.gray.50}' },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
