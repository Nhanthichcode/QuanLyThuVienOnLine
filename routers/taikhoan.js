var express = require("express");
var router = express.Router();
var bcrypt = require("bcryptjs");
var TaiKhoan = require("../models/taikhoan");

// GET: Lấy danh sách tài khoản
router.get("/", async (req, res) => {
  try {
    var taikhoans = await TaiKhoan.find().exec();
    res.render("taikhoan", {
      title: "Danh sách tài khoản",
      taikhoans: taikhoans,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài khoản:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi lấy danh sách tài khoản.",
    });
  }
});

// GET: Thêm tài khoản
router.get("/them", async (req, res) => {
  res.render("taikhoan_them", {
    title: "Thêm tài khoản",
  });
});

// POST: Thêm tài khoản
router.post("/them", async (req, res) => {
  var salt = bcrypt.genSaltSync(10);
  var data = {
    HoVaTen: req.body.HoVaTen,
    Email: req.body.Email,
    TenDangNhap: req.body.TenDangNhap,
    QuyenHan: req.body.QuyenHan,
    MatKhau: bcrypt.hashSync(req.body.MatKhau, salt),
  };
  await TaiKhoan.create(data);
  res.redirect("/taikhoan");
});

// GET: Sửa tài khoản
router.get("/sua/:id", async (req, res) => {
  var id = req.params.id;
  var tk = await TaiKhoan.findById(id);
  res.render("taikhoan_sua", {
    title: "Sửa tài khoản",
    taikhoan: tk,
  });
});

// GET: tài khoản của tôi
router.get("/cuatoi/:id", async (req, res) => {
  var id = req.params.id;
  var tk = await TaiKhoan.findById(id);
  res.render("taikhoan_cuatoi", {
    title: "Hồ sơ cá nhân",
    taikhoan: tk,
  });
});

// POST: Sửa tài khoản
router.post("/sua/:id", async (req, res) => {
  var id = req.params.id;
  var salt = bcrypt.genSaltSync(10);
  var data = {
    HoVaTen: req.body.HoVaTen,
    Email: req.body.Email,
    TenDangNhap: req.body.TenDangNhap,
    QuyenHan: req.body.QuyenHan,
    TrangThai: req.body.TrangThai,
  };
  if (req.body.MatKhau) {
    data["MatKhau"] = bcrypt.hashSync(req.body.MatKhau, salt);
  }
  await TaiKhoan.findByIdAndUpdate(id, data);
  res.render("success", {
    title: "Thành công",
    message: "Sửa tài khoản hoàn tất",
    redirectUrl: "/index",
  });
});

// GET: Xóa tài khoản
router.get("/xoa/:id", async (req, res) => {
  var id = req.params.id;
  await TaiKhoan.findByIdAndDelete(id);
  res.redirect("/taikhoan");
});

module.exports = router;
