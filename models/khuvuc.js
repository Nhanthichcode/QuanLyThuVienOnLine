var mongoose = require("mongoose");
var khuVucSchema = new mongoose.Schema({
  TenKhuVuc: { type: String, required: true },
  ViTri: { type: String },
  MoTa: { type: String },
});
var khuVucModel = mongoose.model("KhuVuc", khuVucSchema);
module.exports = khuVucModel;
