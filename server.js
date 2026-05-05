const express = require("express");
const path = require('path');
require('dotenv').config();

// Import app
const { app } = require('./server/src/app');

// Serve frontend build (IMPORTANT for full stack)
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Basic route (to avoid 502)
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

app.get("/api", (req, res) => {
  res.json({ message: "API working ✅" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server started on port " + PORT);
});