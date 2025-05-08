var mongoose = require("mongoose");

var chuDeSchema = new mongoose.Schema({
  TenChuDe: { type: String, required: true },
  KhuVuc: { type: mongoose.Schema.Types.ObjectId, ref: "KhuVuc" },
  MoTa: { type: String },
});

var chuDeModel = mongoose.model("ChuDe", chuDeSchema);

module.exports = chuDeModel;
