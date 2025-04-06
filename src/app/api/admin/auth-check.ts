import { headers } from "next/headers";

/**
 * Helper function to check and log auth headers for API requests
 * Call this at the beginning of API routes to debug auth-related redirects
 */
export function debugAuthHeaders() {
  if (process.env.DEBUG === "1") {
    const headersList = headers();
    console.log("==== API AUTH DEBUG ====");
    console.log("All headers:", Object.fromEntries(headersList.entries()));
    console.log("Request URL:", headersList.get("x-url") || "unknown");
    console.log("Referer:", headersList.get("referer") || "none");
    console.log("==== END API AUTH DEBUG ====");
  }
}

/**
 * Checks if the current request is likely being redirected in a loop
 */
export function checkForRedirectLoop(request: Request): boolean {
  const url = new URL(request.url);
  const redirectCount = url.searchParams.get("_redirect_count");

  if (redirectCount) {
    const count = parseInt(redirectCount, 10);
    if (count > 3) {
      console.error(`Potential redirect loop detected! Count: ${count}`);
      return true;
    }

    // Increment the count for the next redirect
    url.searchParams.set("_redirect_count", (count + 1).toString());
  } else {
    // First redirect, set count to 1
    url.searchParams.set("_redirect_count", "1");
  }

  return false;
}
