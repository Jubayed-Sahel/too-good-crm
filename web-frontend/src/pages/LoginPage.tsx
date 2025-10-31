import { Box } from '@chakra-ui/react';
import { AuthLayout, LoginForm } from '../components/auth';

const LoginPage = () => {
  return (
    <Box h="100vh" maxH="100vh" overflow="hidden" position="fixed" w="100vw" top={0} left={0}>
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </Box>
  );
};

export default LoginPage;
