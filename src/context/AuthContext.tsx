import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import keycloak from '../config/keycloak';
import { AuthContext } from './auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let refreshInterval: number | null = null;

    // Initialize Keycloak with PKCE flow (only runs once due to empty dependency array)
    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256', // PKCE with SHA-256
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      })
      .then((auth) => {
        setAuthenticated(auth);
        setLoading(false);

        // Set up token refresh
        if (auth) {
          // Refresh token every 60 seconds
          refreshInterval = setInterval(() => {
            keycloak
              .updateToken(70)
              .then((refreshed) => {
                if (refreshed) {
                  console.log('Token refreshed');
                }
              })
              .catch(() => {
                console.error('Failed to refresh token');
                setAuthenticated(false);
              });
          }, 60000);
        }
      })
      .catch((error) => {
        console.error('Failed to initialize Keycloak', error);
        setLoading(false);
      });

    // Cleanup: clear the interval when component unmounts
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const login = useCallback(() => {
    keycloak.login();
  }, []);

  const logout = useCallback(() => {
    keycloak.logout();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        keycloak,
        authenticated,
        loading,
        token: keycloak.token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
