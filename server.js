const path = require('path');

// Change working directory to 'server' to ensure Prisma and .env work correctly
process.chdir(path.join(__dirname, 'server'));

require('dotenv').config();
const { app } = require('./src/app');

/**
 * Entry point for Railway deployment.
 * Binds the Express app to the correct port provided by Railway.
 */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
