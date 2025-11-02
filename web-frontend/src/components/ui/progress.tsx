import { Progress as ChakraProgress } from "@chakra-ui/react"
import { forwardRef } from "react"

export interface ProgressBarProps extends ChakraProgress.TrackProps {
  striped?: boolean
  animated?: boolean
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(props, ref) {
    const { striped, animated, ...rest } = props
    return (
      <ChakraProgress.Track {...rest} ref={ref}>
        <ChakraProgress.Range
          css={{
            ...(striped && {
              backgroundImage:
                "linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
              backgroundSize: "1rem 1rem",
            }),
            ...(animated && {
              animation: "progress-stripes 1s linear infinite",
            }),
          }}
        />
      </ChakraProgress.Track>
    )
  },
)

export interface ProgressRootProps extends ChakraProgress.RootProps {
  striped?: boolean
  animated?: boolean
}

export const ProgressRoot = forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot(props, ref) {
    return <ChakraProgress.Root {...props} ref={ref} />
  },
)

export const ProgressLabel = ChakraProgress.Label
export const ProgressValueText = ChakraProgress.ValueText
