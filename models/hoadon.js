const mongoose = require("mongoose");

const HoaDonSchema = new mongoose.Schema({
  taiKhoanID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TaiKhoan",
    required: true,
  },
  danhSachSanPham: [
    {
      sachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sach",
        required: true,
      },
      soLuong: {
        type: Number,
        required: true,
      },
      giaBan: {
        type: Number,
        required: true,
      },
    },
  ],
  tongTien: {
    type: Number,
    required: true,
  },
  ngayTao: {
    type: Date,
    default: Date.now,
  },
});

const HoaDon = mongoose.model("HoaDon", HoaDonSchema);
module.exports = HoaDon;
