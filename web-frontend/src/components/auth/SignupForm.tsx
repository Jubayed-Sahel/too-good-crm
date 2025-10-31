import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Text,
  Link,
  HStack,
  Separator,
} from '@chakra-ui/react';
import { Toaster, toaster } from '../ui/toaster';
import { Field } from '../ui/field';
import { Checkbox } from '../ui/checkbox';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toaster.create({
        title: 'Error',
        description: 'Please fill in all fields',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toaster.create({
        title: 'Error',
        description: 'Passwords do not match',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (!agreeToTerms) {
      toaster.create({
        title: 'Error',
        description: 'Please agree to the terms and conditions',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    
    // Mock registration - replace with actual API call
    setTimeout(() => {
      toaster.create({
        title: 'Success',
        description: 'Account created successfully!',
        type: 'success',
        duration: 2000,
      });
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Toaster />
      <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="xl" boxShadow="xl" w="full">
        <VStack gap={5} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2}>
              Create Account
            </Heading>
            <Text color="gray.600">
              Get started with LeadGrid today
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap={4}>
              <Field label="Full Name" required>
                <Input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  size="md"
                  h="12"
                />
              </Field>

              <Field label="Email" required>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  size="md"
                  h="12"
                />
              </Field>

              <Field label="Password" required>
                <Box position="relative" w="full">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    size="md"
                    h="12"
                    pr="12"
                    w="full"
                  />
                  <Box
                    position="absolute"
                    right="3"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={1}
                  >
                    <Button
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                      p={2}
                      minW="auto"
                      h="auto"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </Box>
                </Box>
              </Field>

              <Field label="Confirm Password" required>
                <Box position="relative" w="full">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    size="md"
                    h="12"
                    pr="12"
                    w="full"
                  />
                  <Box
                    position="absolute"
                    right="3"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={1}
                  >
                    <Button
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                      size="sm"
                      p={2}
                      minW="auto"
                      h="auto"
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </Box>
                </Box>
              </Field>

              <Box w="full">
                <Checkbox
                  checked={agreeToTerms}
                  onCheckedChange={(details) => setAgreeToTerms(!!details.checked)}
                >
                  <Text fontSize="sm">
                    I agree to the{' '}
                    <Link color="purple.600" fontWeight="medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link color="purple.600" fontWeight="medium">
                      Privacy Policy
                    </Link>
                  </Text>
                </Checkbox>
              </Box>

              <Button
                type="submit"
                colorScheme="purple"
                size="lg"
                w="full"
                h="12"
                loading={isLoading}
                loadingText="Creating account..."
              >
                Create Account
              </Button>
            </VStack>
          </form>

          <Text fontSize="lg" textAlign="center" color="gray.500">
            or
          </Text>

          <Text textAlign="center" fontSize="sm">
            Already have an account?{' '}
            <Link asChild color="purple.600" fontWeight="semibold">
              <RouterLink to="/login">
                Sign in
              </RouterLink>
            </Link>
          </Text>
        </VStack>
      </Box>
    </>
  );
};

export default SignupForm;
