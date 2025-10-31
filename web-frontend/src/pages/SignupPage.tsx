import AuthLayout from '../components/auth/AuthLayout';
import SignupForm from '../components/auth/SignupForm';

const SignupPage = () => {
  return (
    <div className="h-full min-h-screen">
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    </div>
  );
};

export default SignupPage;
