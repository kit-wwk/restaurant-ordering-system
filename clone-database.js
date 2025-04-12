#!/usr/bin/env node

/**
 * Database Cloning Script
 *
 * This script exports data from a local database and imports it to a remote database
 * using the application's API endpoints.
 *
 * Usage: node clone-database.js
 */

import fetch from "node-fetch";
import { writeFile } from "fs/promises";

// Configuration
const LOCAL_API_URL = "http://localhost:3000";
const REMOTE_API_URL = "http://13.230.196.201:8080";
const AUTH_EMAIL = "admin@example.com";
const AUTH_PASSWORD = "123456";

// Models to clone
const MODELS = [
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
    process.exit(1);
  }
}

/**
 * Fetch data from an API endpoint
 */
async function fetchData(apiUrl, endpoint, cookies) {
  try {
    console.log(`Fetching data from ${apiUrl}${endpoint}...`);

    const response = await fetch(`${apiUrl}${endpoint}`, {
      headers: {
        Cookie: cookies,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
    return null;
  }
}

/**
 * Post data to an API endpoint
 */
async function postData(apiUrl, endpoint, data, cookies) {
  try {
    console.log(`Posting data to ${apiUrl}${endpoint}...`);

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error posting data to ${endpoint}:`, error.message);
    return null;
  }
}

/**
 * Replace existing data with new data
 */
async function putData(apiUrl, endpoint, data, cookies) {
  try {
    console.log(`Updating data at ${apiUrl}${endpoint}...`);

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating data at ${endpoint}:`, error.message);
    return null;
  }
}

/**
 * Save data to a backup file
 */
async function saveBackup(data, modelName) {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const filename = `backup-${modelName}-${timestamp}.json`;

    await writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`✅ Backup saved to ${filename}`);
    return filename;
  } catch (error) {
    console.error(`Failed to save backup for ${modelName}:`, error.message);
    return null;
  }
}

/**
 * Clone data from one environment to another
 */
async function cloneData() {
  // Step 1: Login to local and remote
  console.log("🔑 Authenticating...");
  const localCookies = await login(LOCAL_API_URL);
  const remoteCookies = await login(REMOTE_API_URL);

  if (!localCookies || !remoteCookies) {
    console.error(
      "❌ Failed to authenticate. Check credentials and try again."
    );
    process.exit(1);
  }

  console.log("✅ Authentication successful!");

  // Step 2: Process each model
  for (const model of MODELS) {
    console.log(`\n📦 Processing ${model.name}...`);

    // Fetch data from local
    const localData = await fetchData(
      LOCAL_API_URL,
      model.endpoint,
      localCookies
    );

    if (!localData) {
      console.error(`❌ Failed to fetch ${model.name} from local environment.`);
      continue;
    }

    console.log(
      `✅ Successfully fetched ${
        Array.isArray(localData) ? localData.length : 1
      } ${model.name} from local.`
    );

    // Save backup
    await saveBackup(localData, model.name);

    // Handle single object (like restaurant profile) vs array of objects
    if (Array.isArray(localData)) {
      // For collections, we'll post each item individually
      let successCount = 0;

      for (const item of localData) {
        // For some models we might need to clean up the data
        const cleanedItem = cleanItemForImport(model.name, item);

        const result = await postData(
          REMOTE_API_URL,
          model.endpoint,
          cleanedItem,
          remoteCookies
        );
        if (result) {
          successCount++;
        }
      }

      console.log(
        `✅ Successfully imported ${successCount}/${localData.length} ${model.name} to remote.`
      );
    } else {
      // For single objects like restaurant profile
      const cleanedData = cleanItemForImport(model.name, localData);

      // Try PUT first, if that fails try POST
      let result = await putData(
        REMOTE_API_URL,
        model.endpoint,
        cleanedData,
        remoteCookies
      );

      if (!result) {
        result = await postData(
          REMOTE_API_URL,
          model.endpoint,
          cleanedData,
          remoteCookies
        );
      }

      if (result) {
        console.log(`✅ Successfully imported ${model.name} to remote.`);
      } else {
        console.error(`❌ Failed to import ${model.name} to remote.`);
      }
    }
  }

  console.log("\n🎉 Database cloning process completed!");
}

/**
 * Clean up data before importing
 * Some models might need special handling
 */
function cleanItemForImport(modelName, item) {
  const cleanedItem = { ...item };

  // Remove fields that shouldn't be transferred
  delete cleanedItem.createdAt;
  delete cleanedItem.updatedAt;

  // Special handling for specific models
  switch (modelName) {
    case "users":
      // Keep password for users but handle any other user-specific cleanup
      break;

    case "orders":
      // Handle any order-specific data cleanup
      break;

    // Add other cases as needed
  }

  return cleanedItem;
}

/**
 * Run the script
 */
console.log("🚀 Starting database cloning process...");
console.log(`📤 Local: ${LOCAL_API_URL}`);
console.log(`📥 Remote: ${REMOTE_API_URL}`);

cloneData()
  .then(() => {
    console.log("✨ Database cloning completed successfully!");
  })
  .catch((error) => {
    console.error("❌ Database cloning failed:", error);
    process.exit(1);
  });
