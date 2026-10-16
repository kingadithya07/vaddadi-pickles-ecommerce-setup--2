/**
 * Cloudflare Worker: Supabase Image CDN & Edge Router
 * Project: Vaddadi Pickles (https://vaddadi-pickles.onrender.com)
 *
 * Capabilities:
 * 1. Proxies images from Supabase Storage bucket ('vaddadi pickles product images')
 * 2. Caches images on Cloudflare's 280+ global edge data centers for 1 year (365 days)
 * 3. Bypasses Supabase egress bandwidth limits & eliminates cold download latency
 * 4. Automatic CORS headers & health checks
 */

// Supabase origin host
const SUPABASE_ORIGIN = 'https://sbkcxmymhvrorkiiocqi.supabase.co';
const DEFAULT_STORAGE_BUCKET = 'vaddadi pickles product images';
const CACHE_TTL_SECONDS = 31536000; // 365 days

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Range, If-None-Match',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // 2. Health check / status page
    if (url.pathname === '/' || url.pathname === '/health' || url.pathname === '/status') {
      return new Response(
        JSON.stringify(
          {
            status: 'operational',
            service: 'Vaddadi Pickles Cloudflare Image CDN',
            website: 'https://vaddadi-pickles.onrender.com',
            origin: SUPABASE_ORIGIN,
            defaultBucket: DEFAULT_STORAGE_BUCKET,
            cacheTtlDays: 365,
            usage: {
              directSupabasePath: '/storage/v1/object/public/vaddadi%20pickles%20product%20images/<filename>',
              shortBucketPath: '/<bucket>/<filename>',
              shorthandPath: '/<filename>',
              queryParam: '/?url=<supabase-image-url>',
            },
          },
          null,
          2
        ),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache, no-store',
          },
        }
      );
    }

    // 3. Resolve target Supabase origin URL
    let originFetchUrl = '';
    const queryUrl = url.searchParams.get('url');

    if (queryUrl) {
      try {
        const parsed = new URL(queryUrl);
        if (parsed.hostname.endsWith('supabase.co')) {
          originFetchUrl = parsed.toString();
        } else {
          return new Response('Forbidden: Only Supabase storage URLs are permitted', { status: 403 });
        }
      } catch {
        return new Response('Bad Request: Invalid URL parameter', { status: 400 });
      }
    } else {
      let rawPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');

      if (rawPath.startsWith('storage/v1/object/public/')) {
        // Full path format: /storage/v1/object/public/...
        originFetchUrl = `${SUPABASE_ORIGIN}/${encodeURI(rawPath)}`;
      } else if (rawPath.startsWith(DEFAULT_STORAGE_BUCKET)) {
        // Direct bucket path: /vaddadi pickles product images/...
        originFetchUrl = `${SUPABASE_ORIGIN}/storage/v1/object/public/${encodeURI(rawPath)}`;
      } else {
        // Shorthand: /Gongura.jpg -> routes to default bucket
        originFetchUrl = `${SUPABASE_ORIGIN}/storage/v1/object/public/${encodeURIComponent(DEFAULT_STORAGE_BUCKET)}/${encodeURI(rawPath)}`;
      }
    }

    // 4. Edge Cache Inspection
    const cache = caches.default;
    const bypassCache = url.searchParams.has('nocache') || url.searchParams.has('purge');
    const cacheKey = new Request(originFetchUrl, { method: 'GET' });

    if (!bypassCache) {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const response = new Response(cachedResponse.body, cachedResponse);
        response.headers.set('X-CDN-Cache', 'HIT');
        response.headers.set('X-Edge-Server', 'Cloudflare-Worker');
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
      }
    }

    // 5. Fetch from Supabase Storage origin
    try {
      const originResponse = await fetch(originFetchUrl, {
        headers: {
          'Accept': request.headers.get('Accept') || 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'User-Agent': 'Vaddadi-Pickles-Image-CDN/1.0',
        },
        cf: {
          cacheEverything: true,
          cacheTtl: CACHE_TTL_SECONDS,
        },
      });

      if (!originResponse.ok) {
        return new Response(`Origin image returned ${originResponse.status}: ${originResponse.statusText}`, {
          status: originResponse.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache, no-store',
          },
        });
      }

      // 6. Build optimized response with aggressive edge caching
      const responseHeaders = new Headers(originResponse.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      responseHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}, immutable`);
      responseHeaders.set('X-CDN-Cache', 'MISS');
      responseHeaders.set('X-Edge-Server', 'Cloudflare-Worker');
      responseHeaders.set('X-Proxied-Origin', SUPABASE_ORIGIN);

      const responseToReturn = new Response(originResponse.body, {
        status: originResponse.status,
        statusText: originResponse.statusText,
        headers: responseHeaders,
      });

      // Save to Edge cache asynchronously
      ctx.waitUntil(cache.put(cacheKey, responseToReturn.clone()));

      return responseToReturn;
    } catch (err) {
      return new Response(`Cloudflare Worker Gateway Error: ${err.message}`, {
        status: 502,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
