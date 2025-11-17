import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Portal,
} from '@chakra-ui/react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  width?: string | Record<string, string>;
  minWidth?: string;
  height?: string;
  accentColor?: string;
}

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  width = '100%',
  minWidth,
  height = '40px',
  accentColor = 'purple',
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectingRef = useRef<string | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    // Prevent double-selection
    if (selectingRef.current === optionValue) {
      return;
    }
    selectingRef.current = optionValue;
    console.log('[CustomSelect] handleSelect called with:', optionValue);
    console.log('[CustomSelect] Calling onChange with:', optionValue);
    onChange(optionValue);
    setIsOpen(false);
    // Reset after a short delay
    setTimeout(() => {
      selectingRef.current = null;
    }, 100);
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    // Check if click is inside a dialog - if so, don't close the dropdown
    // This prevents the dropdown from closing when clicking inside a dialog
    const isInsideDialog = (target as Element).closest('[role="dialog"]') !== null;
    
    if (
      buttonRef.current &&
      !buttonRef.current.contains(target) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(target) &&
      !isInsideDialog // Don't close if clicking inside a dialog
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Use 'click' instead of 'mousedown' to avoid interfering with option selection
      // The option's onClick with stopPropagation will prevent this from firing
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <Box position="relative" width={width} minWidth={minWidth}>
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        width="100%"
        h={height}
        justifyContent="space-between"
        variant="outline"
        fontSize="sm"
        fontWeight="medium"
        color="gray.700"
        bg="white"
        borderColor={isOpen ? `${accentColor}.500` : 'gray.200'}
        borderRadius="md"
        px={3}
        _hover={{
          borderColor: `${accentColor}.400`,
        }}
        _focus={{
          borderColor: `${accentColor}.500`,
          boxShadow: `0 0 0 1px var(--chakra-colors-${accentColor}-500)`,
        }}
      >
        <Text color={selectedOption ? 'gray.700' : 'gray.400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Box
          as={FiChevronDown}
          transition="transform 0.2s"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          color="gray.500"
        />
      </Button>

      {isOpen && (
        <Portal>
          <Box
            ref={dropdownRef}
            position="fixed"
            left={buttonRef.current?.getBoundingClientRect().left}
            top={(buttonRef.current?.getBoundingClientRect().bottom ?? 0) + 4}
            width={buttonRef.current?.getBoundingClientRect().width}
            zIndex={9999}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="lg"
            maxH="300px"
            overflowY="auto"
            py={1}
            pointerEvents="auto"
            onClick={(e) => {
              // Stop propagation to prevent dialog from closing when clicking dropdown
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              // Stop propagation to prevent dialog from closing
              e.stopPropagation();
            }}
            style={{
              zIndex: 9999,
              isolation: 'isolate',
            }}
          >
            <VStack gap={0} align="stretch">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Button
                    key={option.value}
                    variant="ghost"
                    px={3}
                    py={2}
                    h="auto"
                    minH="auto"
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    bg={isSelected ? `${accentColor}.50` : 'white'}
                    color={isSelected ? `${accentColor}.700` : 'gray.700'}
                    fontWeight={isSelected ? 'semibold' : 'medium'}
                    fontSize="sm"
                    borderRadius={0}
                    _hover={{
                      bg: isSelected ? `${accentColor}.100` : 'gray.50',
                    }}
                    _active={{
                      bg: isSelected ? `${accentColor}.200` : 'gray.100',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Option clicked:', option.value, option.label);
                      handleSelect(option.value);
                    }}
                    onMouseDown={(e) => {
                      // Prevent text selection but allow click
                      if (e.button === 0) {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <Text pointerEvents="none" flex={1} textAlign="left">
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Box as={FiCheck} color={`${accentColor}.600`} pointerEvents="none" ml={2} />
                    )}
                  </Button>
                );
              })}
            </VStack>
          </Box>
        </Portal>
      )}
    </Box>
  );
};

export default CustomSelect;
