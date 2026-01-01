import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
  const { authenticated, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && authenticated) {
      navigate('/home');
    }
  }, [authenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Loading...</h2>
        <p className="text-foreground/70">Initializing authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen flex-col gap-8 bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome to SSO App</h1>
        <p className="text-lg text-foreground/70">Please sign in to continue</p>
      </div>
      <button
        onClick={login}
        className="px-6 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl"
      >
        Sign In with Keycloak
      </button>
    </div>
  );
};

export default SignIn;
