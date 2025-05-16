var express = require("express");
var router = express.Router();
var KhuVuc = require("../models/khuvuc");
const { isAdmin } = require("../middlewares/auth");

// GET: Danh sách khu vực
router.get("/", async (req, res) => {
  try {
    var kv = await KhuVuc.find();
    res.render("khuvuc", {
      title: "Danh sách khu vực",
      khuvuc: kv,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khu vực:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi lấy danh sách khu vực.",
    });
  }
});

// POST: Thêm khu vực
router.get("/them", isAdmin, async (req, res) => {
  try {
    res.render("khuvuc_them", {
      title: "Thêm khu vực",
    });
  } catch (error) {
    console.error("Lỗi khi lấy trang thêm khu vực:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi lấy trang thêm khu vực.",
    });
  }
});
// POST: Xử lý thêm khu vực
router.post("/them", isAdmin, async (req, res) => {
  try {
    if (!req.body.TenKhuVuc || req.body.TenKhuVuc.trim() === "") {
      return res.status(400).render("khuvuc_them", {
        title: "Thêm khu vực",
        error: "Tên khu vực không được để trống. Vui lòng nhập tên khu vực.",
      });
    }

    const existingKhuVuc = await KhuVuc.findOne({
      TenKhuVuc: req.body.TenKhuVuc.trim().toLowerCase(),
    });
    if (existingKhuVuc) {
      return res.status(400).render("khuvuc_them", {
        title: "Thêm khu vực",
        error: "Tên khu vực đã tồn tại. Vui lòng chọn tên khác.",
      });
    }

    var data = {
      TenKhuVuc: req.body.TenKhuVuc.trim(),
      ViTri: req.body.ViTri ? req.body.ViTri.trim() : "",
      MoTa: req.body.MoTa ? req.body.MoTa.trim() : "",
    };
    await KhuVuc.create(data);

    res.render("success", {
      title: "Thành công",
      message: "Khu vực đã được thêm thành công.",
      redirectUrl: "/khuvuc",
    });
  } catch (error) {
    console.error("Lỗi khi thêm khu vực:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi thêm khu vực. Vui lòng thử lại sau.",
    });
  }
});
// GET: Sửa khu vực
router.get("/sua/:id", isAdmin, async (req, res) => {
  try {
    var id = req.params.id;
    var kv = await KhuVuc.findById(id);
    if (!kv) {
      return res.status(404).render("error", {
        title: "Lỗi",
        message: "Khu vực không tồn tại.",
      });
    }
    res.render("khuvuc_sua", {
      title: "Sửa khu vực",
      khuvuc: kv,
    });
  } catch (error) {
    console.error("Lỗi khi lấy trang sửa khu vực:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi lấy trang sửa khu vực.",
    });
  }
});
// POST: Xử lý sửa khu vực
router.post("/sua/:id", isAdmin, async (req, res) => {
  try {
    var id = req.params.id;
    if (!req.body.TenKhuVuc || req.body.TenKhuVuc.trim() === "") {
      return res.status(400).render("khuvuc_sua", {
        title: "Sửa khu vực",
        error: "Tên khu vực không được để trống. Vui lòng nhập tên khu vực.",
        khuvuc: { _id: id, TenKhuVuc: req.body.TenKhuVuc },
      });
    }

    var data = {
      TenKhuVuc: req.body.TenKhuVuc.trim(),
      ViTri: req.body.ViTri ? req.body.ViTri.trim() : "",
      MoTa: req.body.MoTa ? req.body.MoTa.trim() : "",
    };
    await KhuVuc.findByIdAndUpdate(id, data);

    res.render("success", {
      title: "Thành công",
      message: "Khu vực đã được sửa thành công.",
      redirectUrl: "/khuvuc",
    });
  } catch (error) {
    console.error("Lỗi khi sửa khu vực:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi sửa khu vực. Vui lòng thử lại sau.",
    });
  }
});
// GET: xóa chủ đề
router.get("/xoa/:id", isAdmin, async (req, res) => {
  try {
    var id = req.params.id;
    var kv = await KhuVuc.findById(id);
    if (!kv) {
      return res.status(404).render("error", {
        title: "Lỗi",
        message: "Khu vực không tồn tại.",
      });
    }
    await KhuVuc.findByIdAndDelete(id);

    res.render("success", {
      title: "Thành công",
      message: "Khu vực đã được xóa thành công.",
      redirectUrl: "/khuvuc",
    });
  } catch (error) {
    console.error("Lỗi khi xóa khu vực:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi xóa khu vực. Vui lòng thử lại sau.",
    });
  }
});

module.exports = router;
