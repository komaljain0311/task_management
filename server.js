const path = require('path');

/**
 * Bridge script for Railway deployment.
 * This script changes the working directory to 'server' so that 
 * Prisma, relative requires, and .env files work as expected.
 */

// Change working directory to the server folder
process.chdir(path.join(__dirname, 'server'));

// Require the actual entry point (using full relative path for bundlers)
require('./server/src/index.js');
