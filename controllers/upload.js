var aws = require("aws-sdk");
var logger = require("../logic/logger");

exports.showUploadForm = function(request, res) {
  logger.info("S3 upload form requested", { client: request.connection.remoteAddress });
  res.render("index", {
    ejs: { view: "upload", title: "Upload image" }
  });
};
