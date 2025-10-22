const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Convert S3 URL to proxied URL through backend to avoid CORS issues
 */
export function getProxiedImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) {
    return undefined;
  }

  // If it's already a proxied URL, return as is
  if (imageUrl.includes('/api/questions/image-proxy')) {
    return imageUrl;
  }

  // If it's an S3 URL, proxy it through backend
  if (imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('.s3.')) {
    return `${API_BASE_URL}/api/questions/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  }

  // For other URLs (like mathpix), also proxy them
  return `${API_BASE_URL}/api/questions/image-proxy?url=${encodeURIComponent(imageUrl)}`;
}
