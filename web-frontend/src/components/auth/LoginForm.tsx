import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { FiEye, FiEyeOff, FiZap } from "react-icons/fi";
import { useAuth } from "@/hooks";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";

// CSS keyframes as strings
const floatKeyframes = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;

// Inject keyframes into document
if (typeof document !== 'undefined') {
  const styleId = 'login-form-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = floatKeyframes + fadeInUpKeyframes + pulseKeyframes;
    document.head.appendChild(style);
  }
}

const LoginForm = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await login(data);
      
      toaster.create({
        title: "Success",
        description: "Login successful!",
        type: "success",
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Login error details:', error);
      
      // Extract error message with priority
      let errorMessage = "Invalid credentials. Please check your username and password.";
      
      // Handle non_field_errors (DRF validation errors)
      if (error.errors?.non_field_errors) {
        const nonFieldErrors = error.errors.non_field_errors;
        errorMessage = Array.isArray(nonFieldErrors) 
          ? nonFieldErrors[0] 
          : nonFieldErrors;
      }
      // Handle field-specific errors
      else if (error.errors) {
        const errorMessages = Object.entries(error.errors)
          .filter(([field]) => field !== 'non_field_errors') // Skip non_field_errors, already handled
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgArray.join(', ')}`;
          })
          .join('; ');
        if (errorMessages) {
          errorMessage = errorMessages;
        }
      }
      // Handle error message directly
      else if (error.message) {
        errorMessage = error.message;
      }
      // Handle detail field
      else if (error.detail) {
        errorMessage = error.detail;
      }
      
      toaster.create({
        title: "Login Failed",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <VStack gap={6} w="full">
        {/* Logo */}
        <Box 
          textAlign="center"
          animation="fadeInUp 0.6s ease-out"
        >
          <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            w="16"
            h="16"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="2xl"
            boxShadow="xl"
            mb={3}
            animation="float 3s ease-in-out infinite"
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              inset: "-2px",
              borderRadius: "2xl",
              padding: "2px",
              background: "linear-gradient(135deg, #667eea, #764ba2, #667eea)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              opacity: 0.3,
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            <FiZap 
              size={40}
              color="white"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
            />
          </Box>
          <Heading 
            size="xl" 
            color="gray.800" 
            mb={1}
            fontWeight="800"
            letterSpacing="tight"
          >
            TooGood CRM
          </Heading>
        </Box>

        {/* Form Box */}
        <Box
          bg="white"
          p={{ base: 6, md: 8 }}
          borderRadius="2xl"
          boxShadow="2xl"
          w="full"
          border="1px"
          borderColor="gray.100"
          animation="fadeInUp 0.7s ease-out 0.1s both"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <VStack gap={6} align="stretch">
            <Box textAlign="center">
              <Heading 
                size="lg" 
                mb={2}
                background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                backgroundClip="text"
                fontWeight="800"
              >
                Welcome Back
              </Heading>
              <Text color="gray.600" fontWeight="medium">
                Sign in to continue to TooGood CRM
              </Text>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack gap={4}>
                <Field 
                  label="Username" 
                  required
                  invalid={!!errors.username}
                  errorText={errors.username?.message}
                >
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    {...register("username")}
                    size="md"
                    h="12"
                    borderRadius="lg"
                    focusRing="none"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                    }}
                    transition="all 0.2s"
                  />
                </Field>

                <Field 
                  label="Password" 
                  required
                  invalid={!!errors.password}
                  errorText={errors.password?.message}
                >
                  <Box position="relative" w="full">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      size="md"
                      h="12"
                      pr="12"
                      w="full"
                      borderRadius="lg"
                      focusRing="none"
                      _focus={{
                        borderColor: "purple.500",
                        boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                      }}
                      transition="all 0.2s"
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
                  colorPalette="purple"
                  size="lg"
                  w="full"
                  h="12"
                  loading={isLoading}
                  loadingText="Signing in..."
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  fontWeight="bold"
                  fontSize="md"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
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
