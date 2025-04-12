#!/usr/bin/env node

/**
 * Export Categories as SQL
 *
 * This script connects to the database and exports category data as SQL INSERT statements
 *
 * Usage: node export-categories.js
 */

import mysql from "mysql2/promise";
import fs from "fs/promises";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database connection configuration from .env file
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "restaurant_user",
  password: process.env.DB_PASSWORD || "restaurant_password",
  database: process.env.DB_NAME || "restaurant_db",
  port: parseInt(process.env.DB_PORT || "3306", 10),
};

/**
 * Connect to database and fetch all categories
 */
async function exportCategoriesAsSQL() {
  console.log("🔍 Connecting to database...");
  console.log(
    `Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`
  );

  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database");

    // Query categories
    console.log("📋 Fetching categories from database...");
    const [rows] = await connection.execute("SELECT * FROM Category");

    // Generate SQL statements
    console.log(`✅ Found ${rows.length} categories`);
    let sqlStatements = "";

    // Header comment
    sqlStatements +=
      "-- Categories export generated on " + new Date().toISOString() + "\n";
    sqlStatements += "-- Total categories: " + rows.length + "\n\n";

    // INSERT statements
    for (const category of rows) {
      const createdAt = new Date(category.createdAt)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const updatedAt = new Date(category.updatedAt)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      sqlStatements += `INSERT INTO Category (id, name, createdAt, updatedAt, restaurantId) \n`;
      sqlStatements += `VALUES ('${category.id}', '${category.name.replace(
        /'/g,
        "''"
      )}', '${createdAt}', '${updatedAt}', '${category.restaurantId}');\n\n`;
    }

    // Save to file
    const filename = "categories-export.sql";
    await fs.writeFile(filename, sqlStatements);
    console.log(`✅ SQL export saved to ${filename}`);

    // Display the SQL
    console.log("\n📄 SQL INSERT Statements:");
    console.log("------------------------");
    console.log(sqlStatements);

    return sqlStatements;
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    if (connection) {
      console.log("👋 Closing database connection");
      await connection.end();
    }
  }
}

// Run the export
exportCategoriesAsSQL()
  .then(() => {
    console.log("✨ Export completed successfully!");
  })
  .catch((error) => {
    console.error("❌ Export failed:", error.message);
    process.exit(1);
  });
