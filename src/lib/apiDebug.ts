/**
 * API Debug Utility
 *
 * This utility helps debug API issues in different environments.
 */

// Check if we're running in a browser
const isBrowser = typeof window !== "undefined";

// Log API debug information
export function logApiDebug(message: string, data?: unknown) {
  const prefix = "🔍 API Debug:";

  if (process.env.NEXT_PUBLIC_DEBUG_API === "true") {
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

// Enhanced fetch function with debugging
export async function debugFetch(url: string, options?: RequestInit) {
  const apiUrl = getApiUrl();
  const fullUrl = url.startsWith("http") ? url : `${apiUrl}${url}`;

  logApiDebug(`Fetching: ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, options);
    logApiDebug(`Response status: ${response.status}`);

    // Clone the response so we can both log it and return it
    const clonedResponse = response.clone();

    try {
      const data = await clonedResponse.json();
      logApiDebug("Response data:", data);
    } catch {
      logApiDebug("Could not parse response as JSON");
    }

    return response;
  } catch (error) {
    logApiDebug("Fetch error:", error);
    throw error;
  }
}

// Get the correct API URL based on environment
export function getApiUrl() {
  if (!isBrowser) return ""; // On server side, use relative URLs

  // Use environment variables if available
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Default to current origin
  return window.location.origin;
}

// Report API health status
export async function checkApiHealth() {
  try {
    const start = Date.now();
    const response = await fetch("/api/health");
    const duration = Date.now() - start;

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API health check passed in ${duration}ms:`, data);
      return { ok: true, data, duration };
    } else {
      console.error(`❌ API health check failed (${response.status})`);
      return { ok: false, status: response.status, duration };
    }
  } catch (error) {
    console.error("❌ API health check error:", error);
    return { ok: false, error };
  }
}
