import Keycloak from 'keycloak-js';

// Keycloak configuration
// Update these values to match your Keycloak server settings
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'your-realm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'your-client-id',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
