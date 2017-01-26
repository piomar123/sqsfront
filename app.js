var express = require("express");
var app = express();
var utils = require("./utils");
var PORT = 8080;

app.set("view engine", "ejs");
app.disable("view cache");
app.use("/static", express.static("views/static", { fallthrough:false, index:false }));
app.get("/", function(req, res) {
    res.render("index");
});

app.listen(PORT);
