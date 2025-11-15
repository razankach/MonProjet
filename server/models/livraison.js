const mongoose = require("mongoose");

const LivraisonSchema = new mongoose.Schema({
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  id_package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "package",
    required: true
  },
  de_ou: { type: String, required: true },
  a_ou: { type: String, required: true },
  prix: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "on_the_way", "delivered", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Livraison", LivraisonSchema); 