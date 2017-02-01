var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var aws = require("aws-sdk");
var fs = require("fs");
var CONFIG = require("./config");

if(fs.existsSync(CONFIG.AWS_CONFIG_FILE)){
  aws.config.loadFromPath(CONFIG.AWS_CONFIG_FILE);
}

var uploadController = require("./controllers/upload");
var imagesController = require("./controllers/images");
var logsController = require("./controllers/logs");
var errorController = require("./controllers/error");

app.set("view engine", "ejs");
app.disable("view cache");
app.enable("trust proxy");  // forward client IP when behind Elastic Load Balancer
app.use("/static", express.static("views/static", { fallthrough:false, index:false }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(request, res) { res.redirect(302, "/gallery"); });
app.get("/upload", uploadController.showUploadForm);
app.get("/s3done", uploadController.s3uploadDone);
app.get("/gallery", imagesController.showGallery);
app.get("/image/:key*", imagesController.showImage);
app.post("/process", imagesController.processImages);
app.get("/logs", logsController.showLogs);

// this goes last:
app.use(errorController.code404handler);

app.listen(CONFIG.SERVER_PORT);
