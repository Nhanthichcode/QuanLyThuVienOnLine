var mongoose = require("mongoose");

var taiKhoanSchema = new mongoose.Schema({
  HoVaTen: { type: String, required: true },
  Email: { type: String },
  TenDangNhap: { type: String, unique: true, required: true },
  MatKhau: { type: String, required: true },
  QuyenHan: { type: String, default: "Khách hàng" },
  TrangThai: { type: Boolean, default: true },
});

var taiKhoanModel = mongoose.model("TaiKhoan", taiKhoanSchema);

module.exports = taiKhoanModel;
