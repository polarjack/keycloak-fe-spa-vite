import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TokenDisplay } from '../components/TokenDisplay';

interface DecodedToken {
  [key: string]: unknown;
  exp?: number;
}

const Home = () => {
  const { keycloak, logout } = useAuth();
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [decodedRefreshToken, setDecodedRefreshToken] = useState<DecodedToken | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<string>('');

  useEffect(() => {
    if (keycloak?.token) {
      try {
        const decoded = parseJwt(keycloak.token);
        setDecodedToken(decoded);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }

    if (keycloak?.refreshToken) {
      try {
        const decoded = parseJwt(keycloak.refreshToken);
        setDecodedRefreshToken(decoded);
      } catch (error) {
        console.error('Failed to decode refresh token:', error);
      }
    }
  }, [keycloak?.token, keycloak?.refreshToken]);

  const parseJwt = (token: string): DecodedToken => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const handleRefreshToken = async () => {
    if (!keycloak) return;

    setRefreshMessage('Refreshing token...');

    try {
      const refreshed = await keycloak.updateToken(-1); // Force refresh
      if (refreshed) {
        setRefreshMessage('Token refreshed successfully!');
      } else {
        setRefreshMessage('Token is still valid, no refresh needed.');
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
      setRefreshMessage('Failed to refresh token');
    } finally {
      setTimeout(() => setRefreshMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Profile</h1>

        <div className="space-y-6">
          {/* User Actions */}
          <div className="bg-foreground/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Actions</h2>
            <div className="flex gap-4">
              <button
                onClick={handleRefreshToken}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Refresh Token
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
            {refreshMessage && (
              <p className="mt-4 text-sm text-foreground/80">{refreshMessage}</p>
            )}
          </div>

          {/* Access Token */}
          <TokenDisplay
            token={keycloak?.token || ''}
            decodedToken={decodedToken}
            title="Access Token"
          />

          {/* Refresh Token */}
          <TokenDisplay
            token={keycloak?.refreshToken || ''}
            decodedToken={decodedRefreshToken}
            title="Refresh Token"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
