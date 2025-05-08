var mongoose = require("mongoose");

const sachSchema = new mongoose.Schema({
  ChuDe: { type: mongoose.Schema.Types.ObjectId, ref: "ChuDe" },
  TieuDe: { type: String, required: true },
  TomTat: { type: String, required: true },
  NoiDung: { type: String, required: true },
  LuotXem: { type: Number, default: 0 },
  LuotThich: { type: Number, default: 0 },
  LuotBinhLuan: { type: Number, default: 0 },
  HinhAnh: { type: String },
  KiemDuyet: { type: Boolean, default: 0 },
  tags: [{ type: String }],
  NamXuatBan: { type: Date, default: Date.now }, // Thêm trường Năm xuất bản
  NhaXuatBan: { type: String, required: true }, // Thêm trường Nhà xuất bản
  TacGia: { type: String, required: true }, // Thêm trường Tác giả
  DanhGia: { type: Number, default: 0 }, // Thêm trường Đánh giá
  SoLuong: { type: Number, default: 1 }, // Thêm trường Số lượng
  NgonNgu: { type: String, default: "Tiếng Việt" }, // Thêm trường Ngôn ngữ
});

var sachModel = mongoose.model("Sach", sachSchema);

module.exports = sachModel;
