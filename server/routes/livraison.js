const express = require("express");
const Livraison = require("../models/livraison");
const router = express.Router();

// Create livraison
router.post("/", async (req, res) => {
  try {
    const livraison = await Livraison.create(req.body);
    res.json(livraison);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all livraisons
router.get("/", async (req, res) => {
  try {
    const livraisons = await Livraison.find()
      .populate("id_user")
      .populate("id_package");
    res.json(livraisons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single livraison
router.get("/:id", async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id)
      .populate("id_user")
      .populate("id_package");
    if (!livraison) return res.status(404).json({ message: "Livraison not found" });
    res.json(livraison);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update livraison
router.put("/:id", async (req, res) => {
  try {
    const livraison = await Livraison.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(livraison);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete livraison
router.delete("/:id", async (req, res) => {
  try {
    await Livraison.findByIdAndDelete(req.params.id);
    res.json({ message: "Livraison deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
