// mỗi hành động click ở index.ejs sẽ chạy vào router, từ router sẽ chuyển hướng hành động đến trang đích

// chuỗi kết nối
// mongodb+srv://nhanlx151:<db_password>@cluster0.75thtei.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var session = require("express-session");
var path = require("path");

var chudeRouter = require("./routers/chude");
var dangNhapRouter = require("./routers/dangnhap");
var indexRouter = require("./routers/index");
var khuVucRouter = require("./routers/khuvuc");
var sachRouter = require("./routers/sach");
var taikhoanRouter = require("./routers/taikhoan");
var gioHangRouter = require("./routers/giohang");
var hoaDonRouter = require("./routers/hoadon");

var uri =
  "mongodb+srv://nhanlx154_db_user:pCO10H4Awfp3DMwW@cluster0.vggaq2k.mongodb.net/?appName=Cluster0";
mongoose.connect(uri).catch((err) => console.log(err));

// Cấu hình thư mục tĩnh cho uploads trong middleware
app.use(
  "/uploads",
  express.static(path.join(__dirname, "middlewares/uploads"))
);

app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/css", express.static(path.join(__dirname, "CSS")));
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "public")));

app.use(
  session({
    name: "SessionID", // Tên session hợp lệ (không chứa khoảng trắng hoặc ký tự đặc biệt)
    secret: "ConMeoCoKeuSao", // Khóa bảo vệ
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // Hết hạn sau 30 ngày
    },
  })
);

app.use((req, res, next) => {
  // Chuyển biến session thành biến cục bộ
  res.locals.session = req.session;

  // Lấy thông báo (lỗi, thành công) của trang trước đó (nếu có)
  var err = req.session.error;
  var msg = req.session.success;

  // Xóa session sau khi đã truyền qua biến trung gian
  delete req.session.error;
  delete req.session.success;

  // Gán thông báo (lỗi, thành công) vào biến cục bộ
  res.locals.message = "";
  if (err) res.locals.message = '<span class="text-danger">' + err + "</span>";
  if (msg) res.locals.message = '<span class="text-success">' + msg + "</span>";
  next();
});

app.use("/", indexRouter);
app.use("/", dangNhapRouter);
app.use("/chude", chudeRouter);
app.use("/khuvuc", khuVucRouter);
app.use("/sach", sachRouter);
app.use("/taikhoan", taikhoanRouter);
app.use("/giohang", gioHangRouter);
app.use("/hoadon", hoaDonRouter);

app.listen(3003, () => {
  console.log("Lê Trí Nhàn đang fixBug ở http://127.0.0.1:3003");
});
