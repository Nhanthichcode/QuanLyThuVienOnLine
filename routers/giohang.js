const express = require("express");
const router = express.Router();
const GioHang = require("../models/giohang");
const TaiKhoan = require("../models/taikhoan"); // Add this line

// Lấy giỏ hàng của người dùng
router.get("/", async (req, res) => {
  try {
    const gioHang = await GioHang.findOne({
      taiKhoanID: req.session.MaNguoiDung,
    }).populate("sach.sachId");
    var tk = await TaiKhoan.find();
    res.render("giohang", {
      title: "Giỏ hàng của tôi",
      taikhoan: tk,
      gioHang: gioHang ? gioHang.sach : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi tải giỏ hàng.");
  }
});

// Thêm sách vào giỏ hàng
router.post("/them", async (req, res) => {
  try {
    const { sachId } = req.body;
    let gioHang = await GioHang.findOne({
      nguoiDungId: req.session.MaNguoiDung,
    });

    if (!gioHang) {
      gioHang = new GioHang({ nguoiDungId: req.session.MaNguoiDung, sach: [] });
    }

    const index = gioHang.sach.findIndex(
      (item) => item.sachId.toString() === sachId
    );

    if (index !== -1) {
      gioHang.sach[index].soLuong += 1;
    } else {
      gioHang.sach.push({ sachId, soLuong: 1 });
    }

    await gioHang.save();
    res.redirect("/giohang");
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi khi thêm vào giỏ hàng.");
  }
});

module.exports = router;
