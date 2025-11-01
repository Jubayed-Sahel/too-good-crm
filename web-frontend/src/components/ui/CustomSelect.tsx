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

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      buttonRef.current &&
      !buttonRef.current.contains(e.target as Node) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
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
            zIndex={1500}
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="lg"
            maxH="300px"
            overflowY="auto"
            py={1}
          >
            <VStack gap={0} align="stretch">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Box
                    key={option.value}
                    px={3}
                    py={2}
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    bg={isSelected ? `${accentColor}.50` : 'white'}
                    color={isSelected ? `${accentColor}.700` : 'gray.700'}
                    fontWeight={isSelected ? 'semibold' : 'medium'}
                    fontSize="sm"
                    _hover={{
                      bg: isSelected ? `${accentColor}.100` : 'gray.50',
                    }}
                    onClick={() => handleSelect(option.value)}
                    transition="all 0.15s"
                  >
                    <Text>{option.label}</Text>
                    {isSelected && (
                      <Box as={FiCheck} color={`${accentColor}.600`} />
                    )}
                  </Box>
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
