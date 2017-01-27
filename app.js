var express = require("express");
var app = express();
var aws = require('aws-sdk');
var utils = require("./utils");

var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var PORT = 8080;

aws.config.loadFromPath(AWS_CONFIG_FILE);

app.set("view engine", "ejs");
app.disable("view cache");
app.use("/static", express.static("views/static", { fallthrough:false, index:false }));

app.get("/", function(req, res) {
  res.render("index", { ejs: { view: "upload", title: "Upload image" } });
});
app.get("/logs", function(req, res) {
  setTimeout(function(){
    res.render("index", { ejs: { view: "logs", title: "Logs" },
      entries: [{
        timestamp: "1234",
        level: "low",
        message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
        other: "Hello world!"
      }] });
  }, 500);  // simulate async requests
});

app.listen(PORT);
