import { Box } from '@chakra-ui/react';
import { AuthLayout, SignupForm } from '../../components/auth';

const SignupPage = () => {
  return (
    <Box h="100vh" maxH="100vh" overflow="hidden" position="fixed" w="100vw" top={0} left={0}>
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    </Box>
  );
};

export default SignupPage;
