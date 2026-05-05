const path = require('path');
const express = require('express');

/**
 * Entry point for Railway deployment.
 * This script bootstraps the application and binds it to the correct port.
 */

async function bootstrap() {
  console.log("--- SYSTEM BOOTSTRAP STARTING ---");
  console.log("Initial PORT env:", process.env.PORT);

  try {
    // Change working directory to 'server' to ensure Prisma works correctly
    const serverDir = path.join(__dirname, 'server');
    console.log("Switching directory to:", serverDir);
    process.chdir(serverDir);
    
    // Load environment variables from the server folder
    require('dotenv').config();

    // Import the app AFTER changing directory
    console.log("Importing app module...");
    const { app } = require('./src/app');
    
    // Serve frontend build
    const clientDistPath = path.join(__dirname, 'client', 'dist');
    console.log("Serving static files from:", clientDistPath);
    app.use(express.static(clientDistPath));

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log("SUCCESS: Server started on port " + PORT);
      console.log("Listening on 0.0.0.0");
    });
  } catch (error) {
    console.error("FATAL ERROR during bootstrap:");
    console.error(error);
    process.exit(1);
  }
}

bootstrap();