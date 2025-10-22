// Temporary debug file to check what environment variables are loaded
// Run this in the browser console after starting the app

console.log('=== OIDC Configuration Debug ===');
console.log('VITE_OIDC_AUTHORITY:', import.meta.env.VITE_OIDC_AUTHORITY);
console.log('VITE_OIDC_CLIENT_ID:', import.meta.env.VITE_OIDC_CLIENT_ID);
console.log('VITE_OIDC_REDIRECT_URI:', import.meta.env.VITE_OIDC_REDIRECT_URI);
console.log('VITE_COGNITO_DOMAIN:', import.meta.env.VITE_COGNITO_DOMAIN);
console.log('VITE_OIDC_LOGOUT_URI:', import.meta.env.VITE_OIDC_LOGOUT_URI);
console.log('================================');

export {};
