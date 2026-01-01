# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite project using the React Compiler. It's a minimal frontend setup built with modern tooling.

## Development Commands

```bash
# Start development server with HMR
pnpm dev

# Build for production (runs TypeScript compiler first, then Vite build)
pnpm build

# Lint code
pnpm lint

# Preview production build
pnpm preview
```

## Key Architecture Details

### Build System
- **Vite** as the build tool and dev server
- **pnpm** as the package manager
- TypeScript compilation runs before Vite build (`tsc -b && vite build`)

### React Compiler
The project uses the experimental React Compiler via `babel-plugin-react-compiler` configured in `vite.config.ts:9`. This automatically optimizes React components by memoizing them. Be aware this affects dev and build performance.

### TypeScript Configuration
The project uses TypeScript project references with two separate configs:
- `tsconfig.app.json` - for application code in `src/` (targets ES2022, DOM environment)
- `tsconfig.node.json` - for build config files like `vite.config.ts` (targets ES2023, Node environment)

Both configs have strict mode enabled with additional linting flags (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`).

### ESLint Configuration
Uses the new flat config format (`eslint.config.js`) with:
- TypeScript ESLint recommended rules
- React Hooks linting
- React Refresh rules for Vite HMR
- Global ignores for `dist/` directory

### Entry Point
The application entry is `src/main.tsx` which renders the `App` component into `<div id="root">` using React 19's `createRoot` API in StrictMode.

## SSO Authentication

This project implements OAuth 2.0 Authorization Code Flow with PKCE using Keycloak for authentication.

### Key Dependencies
- **keycloak-js** (v26.2.2) - Official Keycloak JavaScript adapter for OAuth 2.0/OIDC
- **react-router-dom** (v7.11.0) - Client-side routing
- **js-beautify** (v1.15.4) - JSON formatting for JWT token display

### Authentication Architecture

**Context & Provider:**
- `src/context/AuthContext.tsx` - Manages authentication state and Keycloak instance
- Initializes Keycloak with PKCE (S256) on app load (once, prevents re-initialization errors)
- Handles automatic token refresh every 60 seconds with proper cleanup
- Uses `useCallback` for stable `login` and `logout` function references
- Properly cleans up token refresh interval on component unmount
- Provides authentication state to all components

**Routing:**
- `src/App.tsx` - Main router setup with protected routes
- `/signin` - Public login page
- `/home` - Protected page (requires authentication)

**Components:**
- `src/components/ProtectedRoute.tsx` - Route guard that redirects unauthenticated users to sign-in

**Pages:**
- `src/pages/SignIn.tsx` - Initiates OAuth flow with Keycloak
- `src/pages/Home.tsx` - Displays user info, JWT tokens, and expiration details
  - Manual token refresh button
  - Logout button (triggers immediate logout via Keycloak)
  - Access token expiration countdown
  - Refresh token expiration countdown
  - Formatted JWT token payloads (header, payload, raw)

**Configuration:**
- `src/config/keycloak.ts` - Keycloak client configuration
- Environment variables (`.env`):
  - `VITE_KEYCLOAK_URL` - Keycloak server URL
  - `VITE_KEYCLOAK_REALM` - Keycloak realm name
  - `VITE_KEYCLOAK_CLIENT_ID` - Client ID

### Security Features
- PKCE (Proof Key for Code Exchange) with SHA-256
- Automatic token refresh with error handling
- Tokens stored in memory (not localStorage)
- Protected routes with authentication guards
- Silent SSO check on page load

### Important Implementation Details
- **Keycloak Initialization**: Only happens once on app mount to prevent "Keycloak can only be initialized once" errors
- **Memory Management**: Token refresh interval is properly cleaned up to prevent memory leaks
- **Logout Flow**: Direct logout via `keycloak.logout()` from the Home page, no intermediate redirect pages
- **Stable References**: `login` and `logout` functions use `useCallback` to maintain stable references and prevent infinite loops in dependent components

For detailed setup instructions, see `README-SSO.md`.
