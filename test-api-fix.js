#!/usr/bin/env node

/**
 * Enhanced API testing script to diagnose redirect loops
 * To run: node test-api-fix.js
 */

const http = require("http");
const https = require("https");

// API endpoints to test
const apiEndpoints = [
  "/api/health",
  "/api/admin/menu",
  "/api/test",
  "/api/admin/restaurant-profile",
];

// Function to make a request with redirect tracking
function makeRequest(url, options = {}, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 10) {
      reject(new Error(`Too many redirects (${redirectCount}) for ${url}`));
      return;
    }

    const protocol = url.startsWith("https") ? https : http;
    const fullUrl = url.startsWith("http")
      ? url
      : `http://localhost:3000${url}`;

    console.log(`Requesting ${fullUrl} (redirect #${redirectCount})`);

    // Add cache-busting parameter to prevent cached responses
    const urlWithTimestamp = `${fullUrl}${
      fullUrl.includes("?") ? "&" : "?"
    }t=${Date.now()}`;

    const req = protocol.get(
      urlWithTimestamp,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          ...options.headers,
        },
      },
      (res) => {
        // Handle redirects
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          console.log(
            `⟲ ${fullUrl} redirected to ${res.headers.location} (${res.statusCode})`
          );
          return makeRequest(res.headers.location, options, redirectCount + 1)
            .then(resolve)
            .catch(reject);
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const statusColor = res.statusCode < 300 ? "✅" : "❌";
          console.log(`${statusColor} ${fullUrl} - Status: ${res.statusCode}`);

          try {
            const jsonData = data.trim().length > 0 ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonData,
              redirectCount,
            });
          } catch (e) {
            console.log(`⚠️ ${fullUrl} - Not JSON: ${e.message}`);
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data,
              redirectCount,
              parseError: e.message,
            });
          }
        });
      }
    );

    req.on("error", (error) => {
      console.error(`❌ ${fullUrl} - Error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

async function testApis() {
  console.log("🚀 Testing API endpoints for redirect issues...");

  for (const endpoint of apiEndpoints) {
    try {
      console.log(`\n📡 Testing endpoint: ${endpoint}`);
      const result = await makeRequest(endpoint);
      console.log(`\nResult for ${endpoint}:`);
      console.log(`  Status: ${result.status}`);
      console.log(`  Redirects: ${result.redirectCount}`);

      if (result.redirectCount > 0) {
        console.log(
          `  ⚠️ WARNING: This endpoint had ${result.redirectCount} redirects!`
        );
      }

      if (result.data && typeof result.data === "object") {
        console.log(
          `  Data: ${JSON.stringify(result.data, null, 2).substring(0, 200)}...`
        );
      }
    } catch (error) {
      console.error(`\n❌ Failed to test ${endpoint}:`, error.message);
    }
  }

  console.log("\n✨ API testing completed");
}

testApis();
