var express = require("express");
var router = express.Router();
var firstImage = require("../modules/firstimage");
var ChuDe = require("../models/chude");
var Sach = require("../models/sach");
var HoaDon = require("../models/hoadon");
const { isUser, isAuth, isAdmin } = require("../middlewares/auth");
const session = require("express-session");

// GET: Trang chủ
router.get("/", async (req, res) => {
  try {
    var cd = await ChuDe.find();
    // Sắp xếp sách theo NamXuatBan giảm dần và DanhGia giảm dần
    var sach = await Sach.find();

    var xnn = await Sach.find()
      .sort({ LuotXem: -1 })
      .limit(3)
      .populate("ChuDe")
      .exec();

    res.render("index", {
      title: "Tất cả sách",
      sach: sach,
      chuyenmuc: cd,
      xemnhieunhat: xnn,
      firstImage: firstImage,
    });
  } catch (error) {
    console.error("Error loading homepage:", error);
    res.redirect("/error");
  }
});

//GET: quản lý hóa đơn
router.get("/hoadon", isAuth, async (req, res) => {
  try {
    const hoaDons = await HoaDon.find()
      .populate("taiKhoanID", "HoVaTen") // Chỉ lấy trường HoVaTen từ mô hình TaiKhoan
      .populate("danhSachSanPham.sachId", "TieuDe GiaBan"); // Chỉ lấy trường TieuDe và GiaBan từ mô hình Sach

    const hoaDonDaTa = hoaDons.map((hoaDon) => ({
      id: hoaDon._id,
      tenNguoiDung: hoaDon.taiKhoanID.HoVaTen,
      tongTien: hoaDon.tongTien,
      ngayTao: hoaDon.ngayTao,
      danhSachSanPham: hoaDon.danhSachSanPham.map((item) => ({
        sachId: item.sachId._id,
        tieuDe: item.sachId.TieuDe,
        giaBan: item.sachId.GiaBan,
        soLuong: item.soLuong,
        thanhTien: item.soLuong * item.sachId.GiaBan,
      })),
    }));

    res.render("hoadon", {
      hoaDons: hoaDonDaTa,
      title: "Tất cả hóa đơn",
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    res.status(500).send("Đã xảy ra lỗi khi lấy danh sách hóa đơn.");
  }
});

// GET: Thuê sách
router.get("/thuesach", isAuth, async (req, res) => {
  var sach = await Sach.find();
  res.render("thuesach", {
    sach: sach,
  });
});
// GET: Xem chi tiết sách
router.get("/sach/chitiet/:id", async (req, res) => {
  try {
    var id = req.params.id;
    var cm = await ChuDe.find();
    var sachDetail = await Sach.findById(id).populate("ChuDe").exec();

    var xnn = await Sach.find({ KiemDuyet: true })
      .sort({ LuotXem: -1 })
      .limit(3)
      .populate("ChuDe")
      .exec();

    res.render("sach_chitiet", {
      chuyenmuc: cm,
      sachDetail: sachDetail,
      xemnhieunhat: xnn,
      firstImage: firstImage,
    });
  } catch (error) {
    console.error("Error loading book details:", error);
    res.redirect("/error");
  }
});

//GET Sách theo chủ đề
router.get("/sach/chude/:id", async (req, res) => {
  try {
    console.log("ID:", req.params.id); // Log ID to console for debugging
    var id = req.params.id;
    var cm = await ChuDe.find();
    var cd = await ChuDe.findById(id);
    // Lấy tên chủ đề:
    var tenChuDe = cd.TenChuDe;
    var xnn = await Sach.find()
      .sort({ LuotXem: -1 })
      .limit(3)
      .populate("ChuDe")
      .exec();

    // Get books by category - keep this filtering
    var sach = await Sach.find({ ChuDe: id }).populate("ChuDe").exec();
    var c = sach.length;
    res.render("sach_chude", {
      title: "Tìm thấy " + c + " kết quả cho " + tenChuDe,
      sach: sach,
      chude: cd,
      chuyenmuc: cm,
      xemnhieunhat: xnn,
      firstImage: firstImage,
    });
  } catch (error) {
    console.error("Error loading books by category:", error);
    res.redirect("/error");
  }
});

// POST: Kết quả tìm kiếm theo tiêu đề
router.post("/timkiem", async (req, res) => {
  try {
    var tukhoa = req.body.tukhoa || ""; // Lấy từ khóa tìm kiếm từ form
    var chuyenmuc = await ChuDe.find(); // Lấy danh sách chủ đề
    var xnn = await Sach.find()
      .sort({ LuotXem: -1 })
      .limit(4)
      .populate("ChuDe")
      .exec(); // Lấy danh sách sách xem nhiều nhất
    // Tìm kiếm sách theo tiêu đề (không phân biệt chữ hoa/chữ thường)
    var sachs = await Sach.find({
      TieuDe: { $regex: tukhoa, $options: "i" }, // Tìm kiếm tiêu đề chứa từ khóa
    }).populate("ChuDe"); // Lấy thông tin chủ đề liên quan
    var count = sachs.length;
    res.render("sach_timkiem", {
      title: "Tìm thấy " + count + " kết quả cho " + tukhoa,
      sach: sachs,
      tukhoa: tukhoa,
      chuyenmuc: chuyenmuc, // Truyền danh sách chủ đề vào view
      xemnhieunhat: xnn, // Truyền danh sách sách xem nhiều nhất vào view
      firstImage: firstImage,
      session: req.session,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sách:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi tìm kiếm sách.",
    });
  }
});

// GET: Trang lỗi
router.get("/error", async (req, res) => {
  res.render("error", {
    title: "Lỗi",
  });
});

// GET: Trang thành công
router.get("/success", async (req, res) => {
  res.render("success", {
    title: "Hoàn thành",
  });
});

module.exports = router;
