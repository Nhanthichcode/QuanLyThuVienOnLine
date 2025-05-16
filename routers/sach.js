var express = require("express");
var fs = require("fs");
var router = express.Router();
var Sach = require("../models/sach");
var ChuDe = require("../models/chude");
var multer = require("multer");
var path = require("path");
var firstImage = require("../modules/firstimage");
const { isAdmin } = require("../middlewares/auth");

// Kiểm tra và tạo thư mục nếu chưa tồn tại
var uploadDir = path.join(__dirname, "../middlewares/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ file
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Thư mục lưu trữ hình ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file theo thời gian
  },
});

// Bộ lọc file (chỉ cho phép upload file ảnh)
var fileFilter = function (req, file, cb) {
  var allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload file ảnh (jpeg, png, gif)."));
  }
};

// Khởi tạo multer
var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file: 5MB
});
// GET: Danh sách sách
router.get("/", async (req, res) => {
  try {
    var sachs = await Sach.find().populate("ChuDe");
    res.render("sach", {
      title: "Danh sách sách",
      sach: sachs,
      firstImage: firstImage,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sách:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi lấy danh sách sách.",
    });
  }
});
// POST: Thêm sách
router.get("/them", isAdmin, async (req, res) => {
  try {
    var cd = await ChuDe.find();
    res.render("sach_them", {
      title: "Thêm sách",
      chude: cd,
      firstImage: firstImage,
    });
  } catch (error) {
    console.error("Lỗi khi lấy trang thêm sách:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi lấy trang thêm sách.",
    });
  }
});
// POST: Xử lý thêm sách
router.post("/them", isAdmin, upload.single("HinhAnh"), async (req, res) => {
  try {
    var data = {
      ChuDe: req.body.ChuDe,
      TieuDe: req.body.TieuDe,
      TomTat: req.body.TomTat,
      NoiDung: req.body.NoiDung,
      HinhAnh: req.file ? req.file.filename : firstImage, // Lưu tên file hình ảnh
      NamXuatBan: req.body.NamXuatBan,
      NhaXuatBan: req.body.NhaXuatBan,
      TacGia: req.body.TacGia,
      DanhGia: req.body.DanhGia || 0,
      SoLuong: req.body.SoLuong || 1,
      NgonNgu: req.body.NgonNgu || "Tiếng Việt",
      GiaBan: req.body.GiaBan || 10000, // Thêm trường Giá bán
      tags: req.body.tags
        ? req.body.tags.split(",").map((tag) => tag.trim())
        : [],
    };
    await Sach.create(data);
    res.render("success", {
      title: "Thành công",
      message: "Sách đã được thêm thành công.",
      redirectUrl: "/sach",
    });
  } catch (error) {
    console.error("Lỗi khi thêm sách:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi thêm sách. Vui lòng thử lại sau.",
    });
  }
});

// GET: Xóa sách
router.get("/xoa/:id", isAdmin, async (req, res) => {
  try {
    var sach = await Sach.findByIdAndDelete(req.params.id);
    if (!sach) {
      return res.status(404).render("error", {
        title: "Lỗi",
        message: "Không tìm thấy sách để xóa.",
      });
    }
    res.redirect("/sach");
  } catch (error) {
    console.error("Lỗi khi xóa sách:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi xóa sách.",
    });
  }
});
// GET: Sửa sách
router.get("/sua/:id", isAdmin, async (req, res) => {
  try {
    var cd = await ChuDe.find();
    var sach = await Sach.findById(req.params.id).populate("ChuDe");
    if (!sach) {
      return res.status(404).render("error", {
        title: "Lỗi",
        message: "Không tìm thấy sách để sửa.",
      });
    }
    res.render("sach_sua", {
      title: "Sửa sách",
      sach: sach,
      chude: cd,
    });
  } catch (error) {
    console.error("Lỗi khi lấy trang sửa sách:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi lấy trang sửa sách.",
    });
  }
});
// POST: Xử lý sửa sách
router.post("/sua/:id", isAdmin, upload.single("HinhAnh"), async (req, res) => {
  try {
    var id = req.params.id;

    // Kiểm tra id hợp lệ
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).render("error", {
        title: "Lỗi",
        message: "ID sách không hợp lệ.",
      });
    }

    var sach = await Sach.findById(id);
    if (!sach) {
      return res.status(404).render("error", {
        title: "Lỗi",
        message: "Không tìm thấy sách để sửa.",
      });
    }

    // Cập nhật thông tin sách
    sach.TieuDe = req.body.TieuDe;
    sach.TomTat = req.body.TomTat;
    sach.NoiDung = req.body.NoiDung;
    if (req.file) {
      sach.HinhAnh = req.file.filename; // Lưu tên file mới
    }
    sach.ChuDe = req.body.ChuDe;
    sach.NamXuatBan = req.body.NamXuatBan;
    sach.NhaXuatBan = req.body.NhaXuatBan;
    sach.TacGia = req.body.TacGia;
    sach.DanhGia = req.body.DanhGia || 0;
    sach.SoLuong = req.body.SoLuong || 1;
    sach.GiaBan = req.body.GiaBan || 10000; // Thêm trường Giá bán
    sach.NgonNgu = req.body.NgonNgu || "Tiếng Việt";
    sach.tags = req.body.tags
      ? req.body.tags.split(",").map((tag) => tag.trim())
      : [];
    sach.KiemDuyet = req.body.KiemDuyet === "on" || req.body.KiemDuyet === true;

    // Lưu thay đổi
    await sach.save();

    res.render("success", {
      title: "Thành công",
      message: "Sách đã được cập nhật thành công.",
      redirectUrl: "/sach",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sách:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi cập nhật sách. Vui lòng thử lại sau.",
    });
  }
});

// GET : Chi tiết sách tăng lượt xem
router.get("/sach_chitiet/:id", async (req, res) => {
  try {
    var id = req.params.id;

    // Kiểm tra id hợp lệ
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).render("error", {
        title: "Lỗi",
        message: "ID sách không hợp lệ.",
      });
    }

    // Tìm sách theo id
    var sachDetail = await Sach.findById(id).populate("ChuDe").exec();

    // Tăng lượt xem và lưu
    sachDetail.LuotXem += 1;
    await sachDetail.save();

    // Nếu không tìm thấy sách
    if (!sachDetail) {
      return res.status(404).render("error", {
        title: "Lỗi",
        message: "Không tìm thấy sách.",
      });
    }

    // Lấy danh sách chủ đề
    var cd = await ChuDe.find();

    // Render trang chi tiết sách
    res.render("sach_chitiet", {
      title: sachDetail.TieuDe, // Thêm tiêu đề trang
      chuyenmuc: cd,
      sachDetail: sachDetail,
      firstImage: firstImage,
      // Truyền hàm firstImage vào view
    });
  } catch (error) {
    console.error("Lỗi khi xem chi tiết sách:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi tải chi tiết sách.",
    });
  }
});

module.exports = router;
