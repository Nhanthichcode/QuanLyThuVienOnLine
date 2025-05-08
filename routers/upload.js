const multer = require("multer");

// Cấu hình nơi lưu trữ ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/middleware/uploads/"); // Thư mục lưu trữ ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Định dạng tên file
  },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ hỗ trợ upload hình ảnh!"), false);
  }
};

// Tạo middleware upload
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
