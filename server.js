const path = require('path');

/**
 * Entry point for Railway deployment.
 * This script imports the app and binds it to the correct port.
 */

// Import the app first (relative to this file)
const { app } = require('./server/src/app');

// Load environment variables before changing directory
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Change working directory to 'server' to ensure Prisma works correctly
process.chdir(path.join(__dirname, 'server'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
