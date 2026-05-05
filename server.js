const path = require('path');
console.log('--- STARTING SERVER BRIDGE ---');
console.log('Current __dirname:', __dirname);
console.log('Initial process.env.PORT:', process.env.PORT);

/**
 * Bridge script for Railway deployment.
 * This script changes the working directory to 'server' so that 
 * Prisma, relative requires, and .env files work as expected.
 */

// Change working directory to the server folder
console.log('Changing directory to /server...');
process.chdir(path.join(__dirname, 'server'));
console.log('New CWD:', process.cwd());

// Require the actual entry point using an absolute path
require(path.join(__dirname, 'server', 'src', 'index.js'));
