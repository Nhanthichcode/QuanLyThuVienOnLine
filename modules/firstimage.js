function firstImage(noiDung) {
  var regExp = /<img[^>]+src="?([^"\s]+)"?[^>]*\/>/g;
  var results = regExp.exec(noiDung);
  var image = "http://127.0.0.1:3001/image/null.png";
  if (results) image = results[1];
  return image;
}

module.exports = firstImage;
