var express = require("express");
var router = express.Router();
var ChuDe = require("../models/chude");

const { isAdmin } = require("../middlewares/auth");

// GET: Danh sách chủ đề
router.get("/", isAdmin, async (req, res) => {
  try {
    var cd = await ChuDe.find();
    res.render("chude", {
      title: "Danh sách chủ đề",
      chude: cd,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chủ đề:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi lấy danh sách chủ đề.",
    });
  }
});

// GET: Thêm chủ đề
router.get("/them", isAdmin, async (req, res) => {
  var cd = await ChuDe.find();
  res.render("chude_them", {
    title: "Thêm chủ đề",
    chude: cd,
  });
});

// POST: Thêm chủ đề
router.post("/them", isAdmin, async (req, res) => {
  try {
    if (!req.body.TenChuDe || req.body.TenChuDe.trim() === "") {
      return res.status(400).render("chude_them", {
        title: "Thêm chủ đề",
        error: "Tên chủ đề không được để trống. Vui lòng nhập tên chủ đề.",
      });
    }

    const existingChuDe = await ChuDe.findOne({
      TenChuDe: req.body.TenChuDe.trim().toLowerCase(),
    });
    if (existingChuDe) {
      return res.status(400).render("chude_them", {
        title: "Thêm chủ đề",
        error: "Tên chủ đề đã tồn tại. Vui lòng chọn tên khác.",
      });
    }

    var data = {
      TenChuDe: req.body.TenChuDe.trim(),
      MoTa: req.body.MoTa,
    };
    await ChuDe.create(data);

    res.render("success", {
      title: "Thành công",
      message: "Chủ đề đã được thêm thành công.",
      redirectUrl: "/chude",
    });
  } catch (error) {
    console.error("Lỗi khi thêm chủ đề:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi thêm chủ đề. Vui lòng thử lại sau.",
    });
  }
});

// GET: Sửa chủ đề
router.get("/sua/:id", isAdmin, async (req, res) => {
  try {
    var id = req.params.id;
    var cd = await ChuDe.findById(id).populate("KhuVuc");
    if (!cd) {
      return res.status(404).render("error", {
        title: "Lỗi",
        message: "Không tìm thấy chủ đề để sửa.",
      });
    }
    var kv = await KhuVuc.find();
    res.render("chude_sua", {
      title: "Sửa chủ đề",
      chude: cd,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chủ đề để sửa:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi lấy chủ đề để sửa.",
    });
  }
});

// POST: Sửa chủ đề
router.post("/sua/:id", isAdmin, async (req, res) => {
  try {
    var id = req.params.id;
    if (!req.body.TenChuDe || req.body.TenChuDe.trim() === "") {
      return res.status(400).render("chude_sua", {
        title: "Sửa chủ đề",
        error: "Tên chủ đề không được để trống. Vui lòng nhập tên chủ đề.",
        chude: { _id: id, TenChuDe: req.body.TenChuDe },
      });
    }

    var data = {
      TenChuDe: req.body.TenChuDe.trim(),
      MoTa: req.body.MoTa,
    };
    await ChuDe.findByIdAndUpdate(id, data);

    res.render("success", {
      title: "Thành công",
      message: "Chủ đề đã được sửa thành công.",
      redirectUrl: "/chude",
    });
  } catch (error) {
    console.error("Lỗi khi sửa chủ đề:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi sửa chủ đề. Vui lòng thử lại sau.",
    });
  }
});

// GET: Xóa chủ đề
router.get("/xoa/:id", isAdmin, async (req, res) => {
  try {
    var id = req.params.id;
    var cd = await ChuDe.findById(id);
    if (!cd) {
      return res.status(404).render("error", {
        title: "Lỗi",
        message: "Không tìm thấy chủ đề để xóa.",
      });
    }
    await ChuDe.findByIdAndDelete(id);

    res.render("success", {
      title: "Thành công",
      message: "Chủ đề đã được xóa thành công.",
      redirectUrl: "/chude",
    });
  } catch (error) {
    console.error("Lỗi khi xóa chủ đề:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi xóa chủ đề. Vui lòng thử lại sau.",
    });
  }
});

module.exports = router;
