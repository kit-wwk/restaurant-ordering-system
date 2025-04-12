# Database Cloning Utility

This utility helps you clone database tables from your local restaurant application to a remote server using the application's API endpoints.

## Prerequisites

- Node.js 18+ installed
- Local server running at http://localhost:3000
- Remote server running at http://13.230.196.201:8080
- Valid admin credentials (provided in the script)

## Setup

1. Create a new directory for the cloning script:

   ```sh
   mkdir db-clone
   cd db-clone
   ```

2. Save these files to the directory:

   - `clone-database.js` - Main script file
   - `test-endpoints.js` - Endpoint testing script
   - `db-clone-package.json` - Rename to `package.json`

3. Install dependencies:
   ```sh
   npm install
   ```

## Usage

### Testing API Endpoints

Before running the full clone, it's recommended to test if all required API endpoints are accessible:

```sh
npm test
```

This will check all endpoints in both local and remote environments and provide a summary.

### Cloning the Database

Once you've confirmed all endpoints are accessible, run the cloning script:

```sh
npm start
```

Or directly with:

```sh
node clone-database.js
```

## What gets cloned

The script will clone the following data:

- Users
- Restaurant profile
- Menu categories
- Menu items
- Promotions
- Bookings
- Orders

## Backup

Before importing data to the remote server, the script creates backup JSON files of all local data in the current directory.

## Troubleshooting

If you encounter authentication issues:

- Ensure both local and remote servers are running
- Verify admin credentials are correct
- Check if the API endpoints are accessible

If you see 404 errors:

- Verify that the API endpoint paths are correct
- Check if the server has those endpoints enabled

## Customization

You can modify the script to:

- Change login credentials
- Add or remove models to clone
- Adjust data cleaning rules for different models
- Change source or destination URLs
