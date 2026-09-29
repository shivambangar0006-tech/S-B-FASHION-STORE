const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get all products
// Supports optional search and category filters
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = `
      SELECT
        id,
        name,
        description,
        category,
        price,
        sale_price,
        image_url,
        stock,
        created_at,
        updated_at
      FROM products
    `;

    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(name ILIKE $${values.length} OR description ILIKE $${values.length})`
      );
    }

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products"
    });
  }
});

// Get one product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        category,
        price,
        sale_price,
        image_url,
        stock,
        created_at,
        updated_at
      FROM products
      WHERE id = $1
      `,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const variantsResult = await pool.query(
      `
      SELECT
        id,
        size,
        color,
        stock
      FROM product_variants
      WHERE product_id = $1
      ORDER BY id
      `,
      [id]
    );

    res.json({
      success: true,
      product: {
        ...productResult.rows[0],
        variants: variantsResult.rows
      }
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch product"
    });
  }
});

module.exports = router;
