require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas đã kết nối thành công!"))
  .catch((error) => console.error("Lỗi kết nối MongoDB:", error));
