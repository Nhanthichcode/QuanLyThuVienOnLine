var mongoose = require("mongoose");

var chuDeSchema = new mongoose.Schema({
  TenChuDe: { type: String, required: true },
  MoTa: { type: String },
});

var chuDeModel = mongoose.model("ChuDe", chuDeSchema);

module.exports = chuDeModel;
