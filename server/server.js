const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });
const express = require("express");
const connectDB = require("./config/db");

const app = express();

const cors = require("cors");

app.use(express.json());
app.use(cors());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));


// Database
connectDB().then(() => {
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
}).catch((error) => {
  console.error("Failed to start server due to DB connection error:", error);
});

