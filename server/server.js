require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Middlewares
app.use(express.json());

// Database
connectDB();

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/users", require("./routes/user"));
app.use("/api/packages", require("./routes/package"));
app.use("/api/livraisons", require("./routes/livraison"));
app.use("/api/reviews", require("./routes/review"));
app.use("/api/notifications", require("./routes/notification"));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

