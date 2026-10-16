/**
 * Image CDN Routing Utility
 * Routes images through Cloudflare CDN/Worker when configured, with seamless fallback to Supabase.
 */

const CDN_URL = (import.meta.env.VITE_IMAGE_CDN_URL || '').replace(/\/+$/, '');
const SUPABASE_PROJECT_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://sbkcxmymhvrorkiiocqi.supabase.co').replace(/\/+$/, '');
const DEFAULT_SUPABASE_HOST = 'https://sbkcxmymhvrorkiiocqi.supabase.co';

/**
 * Transforms an image URL to route via the Cloudflare Edge Worker CDN.
 *
 * Examples:
 * - If VITE_IMAGE_CDN_URL = 'https://vaddadi-pickles-images.vaddadi.workers.dev'
 *   getOptimizedImageUrl('https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles/Gongura.jpg')
 *   -> 'https://vaddadi-pickles-images.vaddadi.workers.dev/storage/v1/object/public/vaddadi%20pickles/Gongura.jpg'
 *
 * - If VITE_IMAGE_CDN_URL is empty:
 *   Returns the original Supabase URL untouched without breaking images.
 *
 * - If passed an emoji ('🥭'), local path ('/logo.png'), or base64 data:
 *   Returns untouched.
 */
export function getOptimizedImageUrl(src?: string | null): string {
  if (!src) return '';

  const trimmed = src.trim();
  if (!trimmed) return '';

  // Local assets, SVGs, Emojis, or Data URIs remain as-is
  if (trimmed.startsWith('/') || trimmed.startsWith('data:') || !trimmed.startsWith('http')) {
    return trimmed;
  }

  // If no CDN is configured, keep the direct origin
  if (!CDN_URL) {
    return trimmed;
  }

  // Already routed through CDN
  if (trimmed.startsWith(CDN_URL)) {
    return trimmed;
  }

  // Replace Supabase project domain with Cloudflare CDN URL
  if (trimmed.startsWith(SUPABASE_PROJECT_URL)) {
    return trimmed.replace(SUPABASE_PROJECT_URL, CDN_URL);
  }

  if (trimmed.startsWith(DEFAULT_SUPABASE_HOST)) {
    return trimmed.replace(DEFAULT_SUPABASE_HOST, CDN_URL);
  }

  return trimmed;
}

/**
 * Helper to inspect the active image CDN status
 */
export function getImageCdnStatus(): { enabled: boolean; cdnUrl: string } {
  return {
    enabled: Boolean(CDN_URL),
    cdnUrl: CDN_URL,
  };
}
