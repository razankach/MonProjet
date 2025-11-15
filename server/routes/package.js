const express = require("express");
const Package = require("../models/package");
const router = express.Router();

// Create package
router.post("/", async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all packages
router.get("/", async (req, res) => {
  try {
    const pkgs = await Package.find();
    res.json(pkgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single package
router.get("/:id", async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update package
router.put("/:id", async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete package
router.delete("/:id", async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: "Package deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
