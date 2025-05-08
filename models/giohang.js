const mongoose = require("mongoose");

const GioHangSchema = new mongoose.Schema({
  taiKhoanID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TaiKhoan",
    required: true,
  },
  sach: [
    {
      sachId: { type: mongoose.Schema.Types.ObjectId, ref: "Sach" },
      soLuong: { type: Number, default: 1 },
      ngayThem: { type: Date, default: Date.now },
    },
  ],
});

const GioHang = mongoose.model("GioHang", GioHangSchema);
module.exports = GioHang;
