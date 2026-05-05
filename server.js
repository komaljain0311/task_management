const path = require('path');

// Change working directory to 'server' to ensure Prisma works correctly
const serverDir = path.join(__dirname, 'server');
process.chdir(serverDir);

// Load environment variables
require('dotenv').config();

// Import the app from the server directory
const { app } = require('./server/src/app');

/**
 * Entry point for Railway deployment.
 * Binds the Express app to the correct port provided by Railway.
 */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
