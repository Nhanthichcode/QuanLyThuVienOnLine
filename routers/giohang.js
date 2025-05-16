const express = require("express");
const router = express.Router();
const GioHang = require("../models/giohang");
const TaiKhoan = require("../models/taikhoan"); // Add this line
const { isAuth } = require("../middlewares/auth");

// Lấy giỏ hàng của người dùng
router.get("/", isAuth, async (req, res) => {
  try {
    console.log("User ID in session:", req.session.MaNguoiDung);

    const gioHang = await GioHang.findOne({
      taiKhoanID: req.session.MaNguoiDung,
    })
      .populate("sach.sachId")
      .exec();

    console.log("Data fetched from GioHang:", gioHang);

    res.render("giohang", {
      title: "Giỏ hàng của tôi",
      gioHang: gioHang ? gioHang.sach : [],
      session: req.session,
    });
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi tải giỏ hàng.",
    });
  }
});
//POST: Thêm sách vào giỏ hàng
router.post("/them/:sachId", isAuth, async (req, res) => {
  try {
    // Kiểm tra đăng nhập
    if (!req.session.MaNguoiDung) {
      return res
        .status(401)
        .json({ success: false, message: "Vui lòng đăng nhập" });
    }
    if (!req.params.sachId) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng cung cấp ID sách" });
    }

    var sachId = req.params.sachId;
    var taikhoanID = req.session.MaNguoiDung;

    // Tìm giỏ hàng với taiKhoanID đúng
    let gioHang = await GioHang.findOne({
      taiKhoanID: taikhoanID,
    });

    // Tạo giỏ hàng mới nếu chưa có
    if (!gioHang) {
      gioHang = new GioHang({
        taiKhoanID: taikhoanID,
        sach: [],
      });
    }

    // Kiểm tra sách đã có trong giỏ chưa
    const index = gioHang.sach.findIndex(
      (item) => item.sachId && item.sachId.toString() === sachId
    );

    if (index !== -1) {
      // Cập nhật số lượng nếu sách đã có
      gioHang.sach[index].soLuong += 1;
    } else {
      // Thêm sách mới vào giỏ
      gioHang.sach.push({
        sachId: sachId,
        soLuong: 1,
      });
    }

    await gioHang.save();

    // Cập nhật session (tùy thuộc vào cách bạn muốn sử dụng)
    req.session.gioHang = gioHang.sach;

    // Trả về phản hồi JSON thay vì redirect nếu muốn ở lại trang
    res.json({ success: true, gioHangCount: gioHang.sach.length });
    // Nếu bạn vẫn muốn redirect, hãy bỏ dòng trên và giữ lại dòng dưới:
    // res.redirect("/giohang");
  } catch (err) {
    console.error("Lỗi thêm vào giỏ hàng:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi thêm vào giỏ hàng." });
  }
});

// POST: Cập nhật số lượng sách trong giỏ hàng
router.post("/capnhat/:sachId", isAuth, async (req, res) => {
  try {
    const sachId = req.params.sachId;
    const soLuongMoi = parseInt(req.body.soLuong);

    // Kiểm tra số lượng hợp lệ
    if (soLuongMoi < 1) {
      return res.status(400).json({
        success: false,
        message: "Số lượng không hợp lệ",
      });
    }

    // Tìm giỏ hàng của người dùng
    const gioHang = await GioHang.findOne({
      taiKhoanID: req.session.MaNguoiDung,
    });

    if (!gioHang) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng",
      });
    }

    // Tìm và cập nhật số lượng sách
    const sachIndex = gioHang.sach.findIndex(
      (item) => item.sachId.toString() === sachId
    );

    if (sachIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách trong giỏ hàng",
      });
    }

    gioHang.sach[sachIndex].soLuong = soLuongMoi;
    await gioHang.save();

    // Cập nhật session
    req.session.gioHang = gioHang.sach;

    res.json({
      success: true,
      message: "Đã cập nhật số lượng",
      gioHangCount: gioHang.sach.length,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật số lượng",
    });
  }
});

// POST: Xóa sách khỏi giỏ hàng
router.post("/xoa/:sachId", isAuth, async (req, res) => {
  try {
    const sachId = req.params.sachId;

    // Tìm và cập nhật giỏ hàng
    const gioHang = await GioHang.findOne({
      taiKhoanID: req.session.MaNguoiDung,
    });

    if (!gioHang) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng",
      });
    }

    // Xóa sách khỏi mảng sách
    gioHang.sach = gioHang.sach.filter(
      (item) => item.sachId.toString() !== sachId
    );

    await gioHang.save();

    // Cập nhật session
    req.session.gioHang = gioHang.sach;

    res.json({
      success: true,
      message: "Đã xóa sách khỏi giỏ hàng",
      gioHangCount: gioHang.sach.length,
    });
  } catch (error) {
    console.error("Lỗi khi xóa sách:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa sách khỏi giỏ hàng",
    });
  }
});

module.exports = router;
