var express = require("express");
var app = express();
var aws = require("aws-sdk");
var CONFIG = require("./config");

aws.config.loadFromPath(CONFIG.AWS_CONFIG_FILE);

var uploadController = require("./controllers/upload");
var imagesController = require("./controllers/images");
var logsController = require("./controllers/logs");
var errorController = require("./controllers/error");

app.set("view engine", "ejs");
app.disable("view cache");
app.enable("trust proxy");  // forward client IP when behind Elastic Load Balancer
app.use("/static", express.static("views/static", { fallthrough:false, index:false }));


app.get("/upload", uploadController.showUploadForm);
app.get("/s3done", uploadController.s3uploadDone);
app.get("/gallery", imagesController.showGallery);
app.get("/logs", logsController.showLogs);

// this goes last:
app.use(errorController.code404handler);

app.listen(CONFIG.SERVER_PORT);
