var express = require("express");
var app = express();
var aws = require("aws-sdk");

var AWS_CONFIG_FILE = "./config.json";
var PORT = 8080;
aws.config.loadFromPath(AWS_CONFIG_FILE);

var uploadController = require("./controllers/upload");
var imagesController = require("./controllers/images");
var logsController = require("./controllers/logs");

app.set("view engine", "ejs");
app.disable("view cache");
app.use("/static", express.static("views/static", { fallthrough:false, index:false }));
app.enable("trust proxy");  // forward client IP when behind Elastic Load Balancer

app.get("/upload", uploadController.showUploadForm);
app.get("/s3done", uploadController.s3uploadDone);
app.get("/gallery", imagesController.showGallery);
app.get("/logs", logsController.showLogs);

app.listen(PORT);
