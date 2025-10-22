import { AuthProviderProps } from 'react-oidc-context';

/**
 * OIDC Authentication Configuration for AWS Cognito
 * 
 * Environment Variables Required:
 * - VITE_OIDC_AUTHORITY: Your AWS Cognito IdP URL
 * - VITE_OIDC_CLIENT_ID: Your OIDC client ID
 * - VITE_OIDC_REDIRECT_URI: Redirect URI after login
 * - VITE_COGNITO_DOMAIN: Your Cognito Hosted UI domain (for logout)
 * - VITE_OIDC_LOGOUT_URI: Redirect URI after logout
 */

const authority = import.meta.env.VITE_OIDC_AUTHORITY;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI || window.location.origin;
const logoutUri = import.meta.env.VITE_OIDC_LOGOUT_URI || window.location.origin;
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

export const oidcConfig: AuthProviderProps = {
  authority: authority || '',
  client_id: clientId || '',
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'phone openid email',
  automaticSilentRenew: true,
  loadUserInfo: true,
  
  // Callback handlers
  onSigninCallback: () => {
    // Remove the OIDC parameters from URL after successful login
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

/**
 * Custom Cognito logout function
 * AWS Cognito requires a specific logout endpoint format
 */
export function cognitoLogout() {
  if (!clientId || !logoutUri || !cognitoDomain) {
    console.error('Cognito logout configuration missing');
    return;
  }
  
  const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  window.location.href = logoutUrl;
}

/**
 * Check if OIDC is properly configured
 */
export function isOidcConfigured(): boolean {
  return !!(authority && clientId);
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus() {
  return {
    authority: authority || 'NOT_SET',
    clientId: clientId ? '***' + clientId.slice(-4) : 'NOT_SET',
    redirectUri,
    logoutUri,
    cognitoDomain: cognitoDomain || 'NOT_SET',
    configured: isOidcConfigured(),
  };
}
