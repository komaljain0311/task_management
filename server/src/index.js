require('dotenv').config();
const { app } = require('./app');

const PORT = process.env.PORT || 5000;
console.log('Detected PORT from environment:', process.env.PORT);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
});
