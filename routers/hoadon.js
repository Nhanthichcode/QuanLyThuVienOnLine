const express = require("express");
const router = express.Router();
const HoaDon = require("../models/hoadon");
const GioHang = require("../models/giohang");
const { isAuth, isAdmin } = require("../middlewares/auth");

router.get("/tao-hoa-don", isAuth, async (req, res) => {
  try {
    const taiKhoanID = req.session.MaNguoiDung;

    // Lấy giỏ hàng của người dùng
    const gioHang = await GioHang.findOne({ taiKhoanID }).populate(
      "sach.sachId"
    );
    if (!gioHang || gioHang.sach.length === 0) {
      return res.status(404).json({ message: "Giỏ hàng trống." });
    }

    // Tính tổng tiền
    const tongTien = gioHang.sach.reduce((total, item) => {
      const gia = item.sachId.GiaBan;
      if (isNaN(gia)) {
        throw new Error(`Giá trị không hợp lệ cho sách ${item.sachId.TieuDe}`);
      }
      return total + gia * item.soLuong;
    }, 0);

    // Tạo danh sách sản phẩm cho hóa đơn
    const danhSachSanPham = gioHang.sach.map((item) => {
      if (!item.sachId.GiaBan) {
        throw new Error(`Giá bán của sách ${item.sachId.TieuDe} không hợp lệ`);
      }

      return {
        sachId: item.sachId._id,
        soLuong: item.soLuong,
        giaBan: item.sachId.GiaBan,
      };
    });

    console.log("Giỏ hàng:", gioHang);
    console.log("Tổng tiền:", tongTien);

    // Tạo hóa đơn mới
    const hoaDon = new HoaDon({
      taiKhoanID: taiKhoanID,
      tongTien: tongTien,
      danhSachSanPham: danhSachSanPham,
      // Thêm các trường khác nếu có
    });

    // Lưu hóa đơn vào database
    await hoaDon.save();

    // Xóa giỏ hàng sau khi thanh toán
    await GioHang.deleteOne({ taiKhoanID });

    // Trả về phản hồi thành công
    res.render("success", {
      title: "Thành công",
      message: "Hóa đơn đã được thanh toán thành công.",
      redirectUrl: "/khuvuc",
    });
  } catch (error) {
    console.error("Lỗi khi tạo hóa đơn:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo hóa đơn." });
  }
});

router.get("/xoa/:id", isAdmin, async (req, res) => {
  try {
    const hoaDon = await HoaDon.findByIdAndDelete(req.params.id);
    if (!hoaDon) {
      return res.status(404).send("Hóa đơn không tồn tại.");
    }
    res.redirect("/hoadon");
  } catch (error) {
    console.error("Lỗi khi xóa hóa đơn:", error);
    res.status(500).send("Đã xảy ra lỗi khi xóa hóa đơn.");
  }
});
router.get("/chitiet/:id", isAuth, async (req, res) => {
  try {
    const hoaDonId = req.params.id;

    // Lấy thông tin hóa đơn và thông tin người dùng liên quan
    const hoaDon = await HoaDon.findById(hoaDonId)
      .populate("danhSachSanPham.sachId")
      .populate("taiKhoanID");

    if (!hoaDon) {
      return res.status(404).send("Hóa đơn không tồn tại.");
    }

    // Truyền dữ liệu vào view EJS
    res.render("hoadon_chitiet", {
      hoaDon: hoaDon,
      tenNguoiDung: hoaDon.taiKhoanID.HoVaTen,
      title: "Chi tiết hóa đơn",
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin hóa đơn:", error);
    res.status(500).send("Đã xảy ra lỗi khi lấy thông tin hóa đơn.");
  }
});

//GET: sửa hóa đơn
router.get("/sua/:id", isAdmin, async (req, res) => {
  try {
    const hoaDonId = req.params.id;

    // Lấy thông tin hóa đơn và thông tin người dùng liên quan
    const hoaDon = await HoaDon.findById(hoaDonId)
      .populate("danhSachSanPham.sachId")
      .populate("taiKhoanID");

    if (!hoaDon) {
      return res.status(404).send("Hóa đơn không tồn tại.");
    }

    // Truyền dữ liệu vào view EJS
    res.render("hoadon_sua", {
      hoaDon: hoaDon,
      tenNguoiDung: hoaDon.taiKhoanID.HoVaTen,
      title: "Cập nhật hóa đơn",
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin hóa đơn:", error);
    res.status(500).send("Đã xảy ra lỗi khi lấy thông tin hóa đơn.");
  }
});

//POST: sửa hóa đơn
router.post("/sua/:id", isAdmin, async (req, res) => {
  try {
    const hoaDonId = req.params.id;
    const { ngayTao, sachId, soLuong } = req.body;
    // sachId và soLuong là mảng

    // Lấy hóa đơn cũ để lấy giá bán
    const hoaDon = await HoaDon.findById(hoaDonId);
    if (!hoaDon) return res.status(404).send("Hóa đơn không tồn tại.");

    // Tạo lại danh sách sản phẩm mới
    let tongTien = 0;
    const danhSachSanPham = hoaDon.danhSachSanPham.map((item, idx) => {
      // Tìm vị trí tương ứng trong mảng gửi lên
      const i = Array.isArray(sachId)
        ? sachId.findIndex((id) => id == item.sachId.toString())
        : 0;
      const soLuongMoi = Array.isArray(soLuong)
        ? parseInt(soLuong[i])
        : parseInt(soLuong);
      const thanhTien = soLuongMoi * item.giaBan;
      tongTien += thanhTien;
      return {
        sachId: item.sachId,
        soLuong: soLuongMoi,
        giaBan: item.giaBan,
      };
    });

    // Cập nhật hóa đơn
    await HoaDon.findByIdAndUpdate(hoaDonId, {
      ngayTao: ngayTao,
      danhSachSanPham: danhSachSanPham,
      tongTien: tongTien,
    });

    res.render("success", {
      title: "Thành công",
      message: "Cập nhật hóa đơn thành công",
      redirectUrl: "/hoadon",
    });
  } catch (error) {
    res.render("error", {
      title: "Thất bại",
      message: "Cập nhật hóa đơn không thành công",
      redirectUrl: "/hoadon",
    });
  }
});

//GET: hóa đơn của tôi
router.get("/cuatoi/:id", isAuth, async (req, res) => {
  try {
    const taikhoanID = req.params.id;
    const hoaDons = await HoaDon.find({ taiKhoanID: taikhoanID })
      .populate("danhSachSanPham.sachId")
      .populate("taiKhoanID", "HoVaTen");
    if (!hoaDons || hoaDons.length === 0) {
      return res.status(404).send("Không có hóa đơn nào.");
    }
    res.render("hoadon", {
      hoaDons: hoaDons,
      title: "Lịch sử mua hàng",
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hóa đơn:", error);
    res.status(500).send("Đã xảy ra lỗi khi lấy danh sách hóa đơn.");
  }
});

module.exports = router;
