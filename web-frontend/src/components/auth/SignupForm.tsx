import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Text,
  Link,
} from "@chakra-ui/react";
import { Toaster, toaster } from "../ui/toaster";
import { Field } from "../ui/field";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/hooks";
import { ROUTES } from "@/config/constants";
import type { RegisterData } from "@/types";
import { isValidEmail, getPasswordStrengthMessage } from "@/utils";

const SignupForm = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordMsg = getPasswordStrengthMessage(formData.password);
      if (passwordMsg !== "Password is valid") {
        newErrors.password = passwordMsg;
      }
    }

    if (!formData.password2) {
      newErrors.password2 = "Please confirm your password";
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords do not match";
    }

    if (!formData.first_name) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name) {
      newErrors.last_name = "Last name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toaster.create({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      toaster.create({
        title: "Success",
        description: "Account created successfully!",
        type: "success",
        duration: 2000,
      });
    } catch (error: any) {
      // Handle server-side validation errors
      if (error.username) {
        setErrors((prev) => ({ ...prev, username: error.username[0] }));
      }
      if (error.email) {
        setErrors((prev) => ({ ...prev, email: error.email[0] }));
      }
      
      toaster.create({
        title: "Registration Failed",
        description: error.detail || error.message || "Unable to create account",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <VStack gap={4} w="full">
        {/* Logo */}
        <Box textAlign="center">
          <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            w={{ base: 12, md: 14 }}
            h={{ base: 12, md: 14 }}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="2xl"
            boxShadow="lg"
            mb={2}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </Box>
          <Heading size={{ base: "lg", md: "xl" }} color="gray.800" mb={0.5}>
            LeadGrid
          </Heading>
        </Box>

        {/* Form Box */}
        <Box
          bg="white"
          p={{ base: 5, md: 6 }}
          borderRadius="xl"
          boxShadow="xl"
          w="full"
        >
          <VStack gap={4} align="stretch">
            <Box textAlign="center">
              <Heading size={{ base: "md", md: "lg" }} mb={1}>
                Create Account
              </Heading>
              <Text color="gray.600" fontSize="sm">Sign up to get started with LeadGrid</Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack gap={3}>
                <Field 
                  label="Username" 
                  required
                  invalid={!!errors.username}
                  errorText={errors.username}
                >
                  <Input
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    size="md"
                    h="10"
                  />
                </Field>

                <Field 
                  label="Email" 
                  required
                  invalid={!!errors.email}
                  errorText={errors.email}
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    size="md"
                    h="10"
                  />
                </Field>

                <Box display="flex" gap={3} w="full">
                  <Field 
                    label="First Name" 
                    required
                    invalid={!!errors.first_name}
                    errorText={errors.first_name}
                    flex={1}
                  >
                    <Input
                      type="text"
                      placeholder="First name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      size="md"
                      h="10"
                    />
                  </Field>

                  <Field 
                    label="Last Name" 
                    required
                    invalid={!!errors.last_name}
                    errorText={errors.last_name}
                    flex={1}
                  >
                    <Input
                      type="text"
                      placeholder="Last name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      size="md"
                      h="10"
                    />
                  </Field>
                </Box>

                <Field 
                  label="Password" 
                  required
                  invalid={!!errors.password}
                  errorText={errors.password}
                >
                  <Box position="relative" w="full">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      size="md"
                      h="10"
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
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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

                <Field 
                  label="Confirm Password" 
                  required
                  invalid={!!errors.password2}
                  errorText={errors.password2}
                >
                  <Box position="relative" w="full">
                    <Input
                      type={showPassword2 ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.password2}
                      onChange={(e) =>
                        setFormData({ ...formData, password2: e.target.value })
                      }
                      size="md"
                      h="10"
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
                        aria-label={
                          showPassword2 ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword2(!showPassword2)}
                        variant="ghost"
                        size="sm"
                        p={2}
                        minW="auto"
                        h="auto"
                      >
                        {showPassword2 ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </Box>
                  </Box>
                </Field>

                <Button
                  type="submit"
                  colorPalette="purple"
                  size="lg"
                  w="full"
                  h="10"
                  loading={isLoading}
                  loadingText="Creating account..."
                >
                  Sign Up
                </Button>
              </VStack>
            </form>

            <Text fontSize="sm" textAlign="center" color="gray.500">
              or
            </Text>

            <Text textAlign="center" fontSize="sm">
              Already have an account?{" "}
              <Link asChild color="purple.600" fontWeight="semibold">
                <RouterLink to={ROUTES.LOGIN}>Sign in</RouterLink>
              </Link>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </>
  );
};

export default SignupForm;
