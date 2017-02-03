var logger = require("../logic/logger");

var afterGetLogs = function(request, res) {
  return function(err, data) {
    if(err){
      throw err;
    }
    res.render("index", {
      ejs: { view: "logs", title: "Logs" },
      entries: data.parsed
    });
  };
};

exports.showLogs = function(req, res) {
  logger.getLogs(afterGetLogs(req, res), req.query);
};
