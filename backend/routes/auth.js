const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not configured.");
}

// Register customer
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingCustomer = await pool.query(
      "SELECT id FROM customers WHERE email = $1",
      [normalizedEmail]
    );

    if (existingCustomer.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO customers (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
      `,
      [name.trim(), normalizedEmail, passwordHash]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      customer: result.rows[0]
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create account"
    });
  }
});

// Login customer
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT id, name, email, password_hash
      FROM customers
      WHERE email = $1
      `,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const customer = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      customer.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured on the server"
      });
    }

    const token = jwt.sign(
      {
        customerId: customer.id,
        email: customer.email
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to login"
    });
  }
});

module.exports = router;
