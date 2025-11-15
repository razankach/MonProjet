require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Middlewares
app.use(express.json());

// Database
connectDB().then(() => {
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
}).catch((error) => {
  console.error("Failed to start server due to DB connection error:", error);
});

