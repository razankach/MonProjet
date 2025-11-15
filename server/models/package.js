const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
  poids: { type: Number, required: true },
  type: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Package", PackageSchema);
