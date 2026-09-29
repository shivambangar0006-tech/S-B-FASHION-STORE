const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/products");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main API route
app.get("/", (req, res) => {
  res.json({
    message: "S&B Fashion Store API is running",
    developer: "Shivam Bangar"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "S&B Fashion Store Backend"
  });
});

// Product routes
app.use("/api/products", productRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`S&B Fashion Store API running on port ${PORT}`);
});
