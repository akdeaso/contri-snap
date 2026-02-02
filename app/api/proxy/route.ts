import { NextRequest, NextResponse } from 'next/server';
import { Agent, fetch as undiciFetch } from 'undici';

export const runtime = 'nodejs'; // Force Node.js runtime
export const dynamic = 'force-dynamic';

const MAX_RETRIES = 3;
const BASE_TIMEOUT_MS = 15000;

// Configured Undici Agent to minimize persistent connection issues
const proxyAgent = new Agent({
  keepAliveTimeout: 10,      // Very short keep-alive
  keepAliveMaxTimeout: 10,   // Do not hold socket open
  connections: 50,           // Max connections
});

async function fetchWithRetry(url: string, attempt = 1): Promise<Response> {
  const timeoutMs = BASE_TIMEOUT_MS;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const urlObj = new URL(url);
    const origin = urlObj.origin;

    console.log(`[Proxy] Attempt ${attempt}: Fetching ${url} (Node Runtime)`);

    // Use undiciFetch for lower-level control, cast response to Standard Response if needed
    // But Next.js Global Fetch uses Undici under the hood. 
    // We can just pass the dispatcher to the global fetch options if we are in Node environment.
    // However, RequestInit type in typical TS doesn't include 'dispatcher'.
    // We will use @ts-ignore or just use undiciFetch directly and wrap it.
    
    // Actually, calling standard fetch with `dispatcher` option works in Node 18+ Next.js context?
    // Let's rely on standard fetch but passed with { dispatcher: proxyAgent } cast to any.
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.facebook.com/',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      signal: controller.signal,
      cache: 'no-store',
      // @ts-ignore
      dispatcher: proxyAgent 
    });
    
    clearTimeout(id);

    // If successful, return immediately
    if (res.ok) return res;

    // Retry on 429 (Too Many Requests) or 5xx (Server Errors)
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
       console.warn(`[Proxy] Attempt ${attempt} failed with status ${res.status}. Retrying...`);
       await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1))); // Exponential backoff
       return fetchWithRetry(url, attempt + 1);
    }
    
    return res;

  } catch (error: any) {
    clearTimeout(id);
    
    // Retry on network errors
    const isRetryable = error.name === 'AbortError' || 
                        error.code === 'ECONNRESET' || 
                        error.code === 'ETIMEDOUT' ||
                        error.code === 'EPROTO' ||
                        error.message.includes('fetch failed') ||
                        error.cause?.code === 'ECONNRESET';

    if (isRetryable && attempt < MAX_RETRIES) {
       console.warn(`[Proxy] Attempt ${attempt} failed with error: ${error.message} (${error.code}). Retrying...`);
       await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1))); // Exponential backoff
       return fetchWithRetry(url, attempt + 1);
    }
    
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
        console.error(`[Proxy] Failed to fetch target: ${response.status} ${response.statusText}`);
        return new NextResponse(`Failed to fetch upstream: ${response.status} ${response.statusText}`, { status: response.status });
    }

    // Get binary data
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Return properly configured response
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cache-Control': 'public, max-age=86400',
      }
    });

  } catch (error: any) {
    console.error('[Proxy] Critical error:', error);
    return new NextResponse('Internal Server Error: ' + error.message, { status: 500 });
  }
}
