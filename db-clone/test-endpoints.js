#!/usr/bin/env node

/**
 * API Endpoint Testing Script
 *
 * Checks if all required API endpoints are accessible before running the full clone
 *
 * Usage: node test-endpoints.js
 */

import fetch from "node-fetch";

// Configuration
const LOCAL_API_URL = "http://localhost:3000";
const REMOTE_API_URL = "http://13.230.196.201:8080";
const AUTH_EMAIL = "admin@example.com";
const AUTH_PASSWORD = "123456";

// Models to test
const ENDPOINTS = [
  { name: "health", endpoint: "/api/health" },
  { name: "users", endpoint: "/api/admin/users" },
  { name: "restaurant-profile", endpoint: "/api/admin/restaurant-profile" },
  { name: "categories", endpoint: "/api/admin/menu/categories" },
  { name: "menu-items", endpoint: "/api/admin/menu/items" },
  { name: "promotions", endpoint: "/api/admin/promotions" },
  { name: "bookings", endpoint: "/api/admin/bookings" },
  { name: "orders", endpoint: "/api/admin/orders" },
];

/**
 * Login to get session cookies
 */
async function login(apiUrl) {
  try {
    console.log(`Authenticating with ${apiUrl}...`);

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: AUTH_EMAIL,
        password: AUTH_PASSWORD,
      }),
      redirect: "manual",
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    // Get cookies from the response
    const cookies = response.headers.get("set-cookie");
    if (!cookies) {
      throw new Error("No cookies received from server");
    }

    // Parse the data to confirm login success
    const data = await response.json();
    if (!data.user) {
      throw new Error("Login failed: Invalid response format");
    }

    console.log(`Logged in as ${data.user.name} (${data.user.role})`);
    return cookies;
  } catch (error) {
    console.error("Authentication error:", error.message);
    return null;
  }
}

/**
 * Test an API endpoint
 */
async function testEndpoint(apiUrl, endpoint, cookies) {
  try {
    console.log(`Testing ${apiUrl}${endpoint.endpoint}...`);

    const response = await fetch(`${apiUrl}${endpoint.endpoint}`, {
      headers: cookies ? { Cookie: cookies } : {},
    });

    return {
      name: endpoint.name,
      url: `${apiUrl}${endpoint.endpoint}`,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    };
  } catch (error) {
    return {
      name: endpoint.name,
      url: `${apiUrl}${endpoint.endpoint}`,
      error: error.message,
      ok: false,
    };
  }
}

/**
 * Test all endpoints
 */
async function testAllEndpoints() {
  console.log("🔍 Testing API endpoints...\n");

  // Local tests
  console.log("🏠 Local Environment Tests");
  console.log("=========================");

  let localCookies = null;
  try {
    localCookies = await login(LOCAL_API_URL);
  } catch (error) {
    console.error("Failed to log in to local environment:", error.message);
  }

  const localResults = [];
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(LOCAL_API_URL, endpoint, localCookies);
    localResults.push(result);

    const icon = result.ok ? "✅" : "❌";
    console.log(
      `${icon} ${result.name}: ${result.status || "ERROR"} ${
        result.statusText || result.error || ""
      }`
    );
  }

  // Remote tests
  console.log("\n🌐 Remote Environment Tests");
  console.log("=========================");

  let remoteCookies = null;
  try {
    remoteCookies = await login(REMOTE_API_URL);
  } catch (error) {
    console.error("Failed to log in to remote environment:", error.message);
  }

  const remoteResults = [];
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(REMOTE_API_URL, endpoint, remoteCookies);
    remoteResults.push(result);

    const icon = result.ok ? "✅" : "❌";
    console.log(
      `${icon} ${result.name}: ${result.status || "ERROR"} ${
        result.statusText || result.error || ""
      }`
    );
  }

  // Summary
  console.log("\n📊 Summary");
  console.log("=========");

  const localSuccess = localResults.filter((r) => r.ok).length;
  const remoteSuccess = remoteResults.filter((r) => r.ok).length;

  console.log(`Local endpoints: ${localSuccess}/${ENDPOINTS.length} available`);
  console.log(
    `Remote endpoints: ${remoteSuccess}/${ENDPOINTS.length} available`
  );

  if (localSuccess === ENDPOINTS.length && remoteSuccess === ENDPOINTS.length) {
    console.log(
      "\n✅ All endpoints are accessible! You can run the clone script."
    );
    return true;
  } else {
    console.log(
      "\n⚠️ Some endpoints are not accessible. Review the results before running the clone script."
    );
    return false;
  }
}

// Run the tests
testAllEndpoints()
  .then((success) => {
    console.log("\n✨ Endpoint testing completed!");
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  });
