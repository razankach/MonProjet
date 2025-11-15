const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prenom: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true , unique: true},
  password: { type: String, required: true },
  address: String,
  photoCarteNationale: String,
  rating: { type: Number, default: 5 },
  location: {
    lat: Number,
    lng: Number
  },
  age: Number
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
