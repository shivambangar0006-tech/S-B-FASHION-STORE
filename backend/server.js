const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "S&B Fashion Store API is running",
    developer: "Shivam Bangar"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "S&B Fashion Store Backend"
  });
});

app.listen(PORT, () => {
  console.log(`S&B Fashion Store API running on port ${PORT}`);
});
