# SSO Integration with Keycloak

This application implements OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange) for secure authentication with a self-hosted Keycloak SSO provider.

## Features

- **Sign In Page**: Initiates OAuth 2.0 login flow with Keycloak
- **Home Page (Protected)**: Displays JWT token details and user information
  - Manual token refresh button with status feedback
  - Logout button with immediate logout (no intermediate redirect)
  - Access token expiration timestamp and countdown
  - Refresh token expiration timestamp and countdown
  - Beautifully formatted JWT token display (header, payload, raw)
  - User information display (username, email, name)
- **PKCE Security**: Uses SHA-256 for enhanced security in the authorization code flow
- **Automatic Token Refresh**: Keeps user session alive with automatic token renewal every 60 seconds with proper cleanup
- **Memory Management**: Prevents memory leaks with proper interval cleanup on unmount
- **Stable Function References**: Uses `useCallback` to prevent infinite loops

## Project Structure

```
src/
├── config/
│   └── keycloak.ts              # Keycloak client configuration
├── context/
│   └── AuthContext.tsx          # Authentication context and provider with memory leak prevention
├── components/
│   └── ProtectedRoute.tsx       # Route guard for authenticated pages
├── pages/
│   ├── SignIn.tsx               # Login page
│   └── Home.tsx                 # Protected home page with JWT display and logout
└── App.tsx                      # Main app with routing
```

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
pnpm install
```

### 2. Configure Keycloak Server

First, set up your Keycloak server:

1. Start Keycloak (if running locally):
   ```bash
   docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
   ```

2. Access Keycloak Admin Console at `http://localhost:8080`

3. Create a new Realm or use an existing one

4. Create a new Client:
   - Client ID: `your-client-id` (e.g., `mpc-mvp-fe`)
   - Client Type: `OpenID Connect`
   - Client Authentication: `Off` (public client)
   - Valid Redirect URIs: `http://localhost:5173/*`
   - Valid Post Logout Redirect URIs: `http://localhost:5173/*`
   - Web Origins: `http://localhost:5173`

5. In the client settings:
   - Enable "Standard Flow" (Authorization Code Flow)
   - Enable "Direct Access Grants"
   - Set "PKCE Code Challenge Method" to `S256`

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Keycloak settings:
   ```env
   VITE_KEYCLOAK_URL=http://localhost:8080
   VITE_KEYCLOAK_REALM=your-realm-name
   VITE_KEYCLOAK_CLIENT_ID=your-client-id
   ```

### 4. Run the Application

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## How It Works

### OAuth 2.0 Authorization Code Flow with PKCE

1. **User visits Sign In page** → App redirects to Keycloak login
2. **User authenticates** → Keycloak redirects back with authorization code
3. **App exchanges code for tokens** → Using PKCE code verifier (SHA-256)
4. **Tokens stored in memory** → Access token, refresh token, and ID token
5. **Automatic token refresh** → Every 60 seconds, checks if token needs refresh
6. **Protected routes** → ProtectedRoute component guards authenticated pages

### Key Security Features

- **PKCE (S256)**: Prevents authorization code interception attacks
- **Token refresh**: Automatic silent token renewal
- **Public client**: No client secret required (secure for SPAs)
- **Silent check SSO**: Checks authentication without user interaction

## Pages

### Sign In (`/signin`)
- Displays a "Sign In with Keycloak" button
- Redirects authenticated users to home page
- Shows loading state during initialization

### Home (`/home`)
- **Protected route** - requires authentication
- **Action buttons**:
  - Refresh Token button - Manually trigger token refresh with visual feedback
  - Logout button - Immediately triggers `keycloak.logout()` (no intermediate redirect)
- **User Information** section:
  - Username, email, and name from token claims
- **Access Token Expiration** section:
  - Expiration timestamp (human-readable local date/time)
  - Countdown timer showing seconds until expiration
- **JWT Token Details** section (formatted with js-beautify):
  - Token Header (decoded)
  - Token Payload (decoded with all claims)
  - Raw Token (complete JWT string)
- **Refresh Token** section:
  - Expiration timestamp (human-readable local date/time)
  - Countdown timer showing seconds until expiration
  - Refresh Token Payload (decoded with all claims)
  - Raw Refresh Token (complete JWT string)

## Token Management

The application automatically handles:
- **Token storage**: Tokens kept in memory (secure for SPAs)
- **Token refresh**: Refreshes access token every 60 seconds if needed
- **Token expiration**: Redirects to login if refresh fails
- **Silent SSO check**: Validates session on page load
- **Cleanup on unmount**: Properly clears token refresh intervals to prevent memory leaks
- **Stable references**: Uses `useCallback` for `login` and `logout` functions to prevent re-renders

## Development Tips

### Testing Authentication

1. Access `http://localhost:5173` → Redirects to `/signin`
2. Click "Sign In with Keycloak"
3. Login with Keycloak credentials
4. You'll be redirected to `/home` with comprehensive JWT details:
   - View user information
   - Monitor access token expiration countdown
   - Monitor refresh token expiration countdown
   - Inspect formatted JWT payloads
5. Test manual token refresh by clicking "Refresh Token" button
6. Click "Logout" to immediately logout (redirects to Keycloak logout)

### Debugging

Check browser console for:
- Keycloak initialization logs
- Token refresh logs
- Authentication errors

### Common Issues

**"Keycloak can only be initialized once" error**
- This has been fixed by ensuring Keycloak initialization only runs once on app mount
- The `useEffect` has an empty dependency array to prevent re-initialization
- Proper cleanup prevents this error when component unmounts

**"Failed to initialize Keycloak"**
- Check if Keycloak server is running
- Verify environment variables are correct
- Check browser console for CORS errors

**"Failed to refresh token"**
- Token may have expired completely
- Check Keycloak session settings
- User will be logged out automatically

**Redirect URI mismatch**
- Ensure `http://localhost:5173/*` is in Keycloak client's valid redirect URIs
- Check for trailing slashes

**Infinite loop on logout**
- This has been fixed by using `useCallback` for logout function
- No intermediate redirect page needed - logout happens directly from Home page

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router 7** for routing
- **keycloak-js (v26.2.2)** for OAuth 2.0 / OIDC integration
- **js-beautify (v1.15.4)** for JSON formatting in token display
- **PKCE (S256)** for enhanced security

## Security Considerations

1. **No client secret**: This is a public client (SPA), secrets would be exposed
2. **PKCE required**: Mitigates authorization code interception
3. **Tokens in memory**: More secure than localStorage for SPAs
4. **HTTPS in production**: Always use HTTPS for production deployments
5. **Token refresh**: Keeps sessions alive without re-authentication

## Production Deployment

For production:

1. Update environment variables for production Keycloak URL
2. Configure production redirect URIs in Keycloak
3. Enable HTTPS
4. Consider using a reverse proxy for additional security
5. Set appropriate CORS policies
6. Configure proper token lifetimes in Keycloak

## Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
- [keycloak-js Library](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
