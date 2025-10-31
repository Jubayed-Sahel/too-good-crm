import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="h-full min-h-screen">
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </div>
  );
};

export default LoginPage;
