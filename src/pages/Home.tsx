import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TokenDisplay } from '../components/TokenDisplay';
import { fetchUserProfile } from '../services/api';
import type { ApiResponse, UserData } from '../services/api';

interface DecodedToken {
  [key: string]: unknown;
  exp?: number;
}

const Home = () => {
  const { keycloak, logout } = useAuth();
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [decodedRefreshToken, setDecodedRefreshToken] = useState<DecodedToken | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<ApiResponse<UserData> | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');

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

  const handleBackendApiCall = async () => {
    if (!keycloak?.token) {
      setApiError('No access token available');
      return;
    }

    setApiLoading(true);
    setApiError('');
    setApiResponse(null);

    try {
      const response = await fetchUserProfile(keycloak.token);
      setApiResponse(response);

      if (response.error) {
        setApiError(`${response.error.type}: ${response.error.message}`);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to fetch user profile');
    } finally {
      setApiLoading(false);
    }
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
                onClick={handleBackendApiCall}
                disabled={apiLoading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {apiLoading ? 'Loading...' : 'Backend API'}
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

          {/* Backend API Response */}
          {(apiResponse || apiError) && (
            <div className="bg-foreground/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Backend API Response</h2>
              {apiError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <p className="text-red-500 font-semibold">Error</p>
                  <p className="text-red-400 text-sm mt-1">{apiError}</p>
                </div>
              )}
              {apiResponse && !apiError && apiResponse.data && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-500 font-semibold mb-2">Success (Status: {apiResponse._status})</p>
                  <div className="text-foreground/80 text-sm space-y-1">
                    <p><span className="font-medium">ID:</span> {apiResponse.data.id}</p>
                    <p><span className="font-medium">Email:</span> {apiResponse.data.email}</p>
                    <p><span className="font-medium">Username:</span> {apiResponse.data.username}</p>
                    <p><span className="font-medium">Keycloak User ID:</span> {apiResponse.data.keycloak_user_id}</p>
                    <p><span className="font-medium">Active:</span> {apiResponse.data.is_active ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Email Verified:</span> {apiResponse.data.email_verified ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Created At:</span> {new Date(apiResponse.data.created_at).toLocaleString()}</p>
                    <p><span className="font-medium">Updated At:</span> {new Date(apiResponse.data.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}

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
