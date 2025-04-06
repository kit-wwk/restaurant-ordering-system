#!/usr/bin/env node

/**
 * Simple API testing script to check if API routes are working
 * To run: node test-api.js
 */

const http = require("http");

const apiEndpoints = ["/api/health", "/api/admin/restaurant-profile"];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3000${url}`, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`✅ ${url} - Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          console.log(`❌ ${url} - Failed to parse JSON: ${e.message}`);
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", (error) => {
      console.error(`❌ ${url} - Error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

async function testApis() {
  console.log("🚀 Testing API endpoints...");

  for (const endpoint of apiEndpoints) {
    try {
      const result = await makeRequest(endpoint);
      console.log(`Result for ${endpoint}:`, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(`Failed to test ${endpoint}:`, error.message);
    }
  }

  console.log("✨ API testing completed");
}

testApis();
