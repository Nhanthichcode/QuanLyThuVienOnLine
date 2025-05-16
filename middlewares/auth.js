const isAuth = (req, res, next) => {
  if (req.session && req.session.MaNguoiDung) {
    return next();
  }
  res.redirect("/dangnhap");
};

const isAdmin = (req, res, next) => {
  if (
    req.session &&
    req.session.MaNguoiDung &&
    req.session.QuyenHan === "admin"
  ) {
    return next();
  }
  res.redirect("/dangnhap");
};

const isUser = (req, res, next) => {
  if (
    req.session &&
    req.session.MaNguoiDung &&
    req.session.QuyenHan === "Khách hàng"
  ) {
    return next();
  }
  res.redirect("/dangnhap");
};

module.exports = { isAuth, isAdmin, isUser };
