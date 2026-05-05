const path = require('path');
const express = require('express');

// Import the app first
const { app } = require('./server/src/app');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

/**
 * Entry point for Railway deployment.
 * This script bootstraps the application and binds it to the correct port.
 */

async function bootstrap() {
  try {
    // Change working directory to 'server' to ensure Prisma works correctly
    process.chdir(path.join(__dirname, 'server'));
    
    // Serve frontend build
    app.use(express.static(path.join(__dirname, 'client', 'dist')));

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server started on port " + PORT);
    });
  } catch (error) {
    console.error("Failed to bootstrap server:", error);
    process.exit(1);
  }
}

bootstrap();