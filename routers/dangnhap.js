var express = require("express");
var router = express.Router();
var bcrypt = require("bcryptjs");
var TaiKhoan = require("../models/taikhoan");

// GET: Đăng ký
router.get("/dangky", async (req, res) => {
  res.render("dangky", {
    title: "Đăng ký tài khoản",
  });
});

// POST: Đăng ký
router.post("/dangky", async (req, res) => {
  try {
    // Kiểm tra mật khẩu không được để trống
    if (!req.body.MatKhau || req.body.MatKhau.trim() === "") {
      req.session.error = "Mật khẩu không được để trống.";
      return res.redirect("/dangky");
    }

    // Kiểm tra mật khẩu khớp
    if (req.body.MatKhau !== req.body.NhapLaiMatKhau) {
      res.render("error", {
        title: "Thất bại",
        message: "Mật khẩu không khớp.",
        redirectUrl: "/dangky",
      });
    }

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    var taikhoan = await TaiKhoan.findOne({
      TenDangNhap: req.body.TenDangNhap,
    }).exec();
    if (taikhoan) {
      res.render("error", {
        title: "Thất bại",
        message: "Tên đăng nhập đã tồn tại.",
        redirectUrl: "/dangky",
      });
      return;
    }

    // Kiểm tra email đã tồn tại chưa
    var email = await TaiKhoan.findOne({
      Email: req.body.Email,
    }).exec();
    if (email) {
      res.render("error", {
        title: "Thất bại",
        message: "Email đã tồn tại.",
        redirectUrl: "/dangky",
      });
      return;
    }

    // Tạo tài khoản mới
    var salt = bcrypt.genSaltSync(10);
    var data = {
      HoVaTen: req.body.HoVaTen,
      Email: req.body.Email,
      TenDangNhap: req.body.TenDangNhap,
      TrangThai: true,
      QuyenHan: "Khách hàng",
      MatKhau: bcrypt.hashSync(req.body.MatKhau, salt),
    };
    await TaiKhoan.create(data);

    // Đăng ký thành công
    res.render("success", {
      title: "Thành công",
      message: "Đã đăng ký tài khoản thành công.",
      redirectUrl: "/chude",
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký tài khoản:", error);
    req.session.error = "Đã xảy ra lỗi khi đăng ký tài khoản.";
    return res.redirect("/dangky");
  }
});

// GET: Đăng nhập
router.get("/dangnhap", async (req, res) => {
  res.render("dangnhap", {
    title: "Đăng nhập",
  });
});

// POST: Đăng nhập
router.post("/dangnhap", async (req, res) => {
  try {
    var taikhoan = await TaiKhoan.findOne({
      TenDangNhap: req.body.TenDangNhap,
    }).exec();

    if (taikhoan) {
      if (bcrypt.compareSync(req.body.MatKhau, taikhoan.MatKhau)) {
        if (taikhoan.TrangThai == false) {
          req.session.error = "Người dùng đã bị khóa tài khoản.";
          return res.redirect("/error");
        }

        // Đăng ký session
        req.session.MaNguoiDung = taikhoan._id.toString();
        req.session.HoVaTen = taikhoan.HoVaTen;
        req.session.QuyenHan = taikhoan.QuyenHan;
        req.session.isAuthenticated = true; // Thêm flag xác thực

        // Initialize empty cart in session
        req.session.gioHang = taikhoan.gioHang || [];
        // Save session before redirect
        req.session.save((err) => {
          if (err) {
            console.error("Lỗi lưu session:", err);
            return res.redirect("/error");
          }
          return res.redirect("/");
        });
      } else {
        req.session.error = "Mật khẩu không đúng.";
        return res.redirect("/error");
      }
    } else {
      req.session.error = "Tên đăng nhập không tồn tại.";
      return res.redirect("/error");
    }
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    req.session.error = "Đã xảy ra lỗi khi đăng nhập.";
    return res.redirect("/error");
  }
});

// GET: Đăng xuất
router.get("/dangxuat", async (req, res) => {
  if (req.session.MaNguoiDung) {
    // Xóa session
    delete req.session.MaNguoiDung;
    delete req.session.HoVaTen;
    delete req.session.QuyenHan;

    res.redirect("/");
  } else {
    req.session.error = "Người dùng chưa đăng nhập.";
    res.redirect("/error");
  }
});

// GET: Quên mật khẩu
router.get("/quenmatkhau", async (req, res) => {
  res.render("quenmatkhau", {
    title: "Quên mật khẩu",
  });
});
// POST: Quên mật khẩu
router.post("/quenmatkhau", async (req, res) => {
  var taikhoan = await TaiKhoan.findOne({
    Email: req.body.Email,
  }).exec();
  if (taikhoan) {
    // Gửi email với mật khẩu mới
    var newPassword = Math.random().toString(36).slice(-8);
    var salt = bcrypt.genSaltSync(10);
    taikhoan.MatKhau = bcrypt.hashSync(newPassword, salt);
    await taikhoan.save();
    // Gửi email với mật khẩu mới
    req.session.success = "Đã gửi mật khẩu mới vào email của bạn.";
    res.render("success", {
      title: "Thành công",
      message: "Đã gửi mật khẩu mới vào email của bạn.",
      redirectUrl: "/",
    });
  } else {
    req.session.error = "Email không tồn tại.";
    res.redirect("/error");
  }
});

// GET: Đăng ký
router.get("/admin", async (req, res) => {
  res.render("admin", {
    title: "Trang quản trị",
  });
});
module.exports = router;
