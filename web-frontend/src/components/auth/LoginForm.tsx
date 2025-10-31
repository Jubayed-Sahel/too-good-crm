import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toaster.create({
        title: "Error",
        description: "Please fill in all fields",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    // Mock authentication - replace with actual API call
    setTimeout(() => {
      toaster.create({
        title: "Success",
        description: "Login successful!",
        type: "success",
        duration: 2000,
      });
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <Toaster />
      <VStack gap={6} w="full">
        {/* Logo */}
        <Box textAlign="center">
          <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            w="16"
            h="16"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="2xl"
            boxShadow="lg"
            mb={3}
          >
            <svg className="w-10 h-10" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Box>
          <Heading size="xl" color="gray.800" mb={1}>
            LeadGrid
          </Heading>
        </Box>

        {/* Form Box */}
        <Box
          bg="white"
          p={{ base: 6, md: 8 }}
          borderRadius="xl"
          boxShadow="xl"
          w="full"
        >
          <VStack gap={6} align="stretch">
            <Box textAlign="center">
              <Heading size="lg" mb={2}>
                Welcome Back
              </Heading>
              <Text color="gray.600">Sign in to continue to LeadGrid</Text>
            </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap={4}>
              <Field label="Email" required>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="md"
                  h="12"
                />
              </Field>

              <Field label="Password" required>
                <Box position="relative" w="full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <Box w="full" textAlign="right">
                <Link
                  asChild
                  color="purple.600"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  <RouterLink to="/forgot-password">
                    Forgot password?
                  </RouterLink>
                </Link>
              </Box>

              <Button
                type="submit"
                colorScheme="purple"
                size="lg"
                w="full"
                h="12"
                loading={isLoading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </VStack>
          </form>

          <Text fontSize="lg" textAlign="center" color="gray.500">
            or
          </Text>

          <Text textAlign="center" fontSize="sm">
            Don't have an account?{" "}
            <Link asChild color="purple.600" fontWeight="semibold">
              <RouterLink to="/signup">Sign up</RouterLink>
            </Link>
          </Text>
        </VStack>
      </Box>
      </VStack>
    </>
  );
};

export default LoginForm;
