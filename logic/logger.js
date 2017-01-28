var aws = require("aws-sdk");
var uuid = require("uuid");
var moment = require("moment");
var DB_DOMAIN = "piotr.marcinczyk.logs";
var LOG_PREFIX = "lab-log-";

var simpledb = new aws.SimpleDB();

simpledb.createDomain({ DomainName: DB_DOMAIN }, function(err, data) {
	if(err) {
		console.log(err, err.stack);
		return;
	}
	console.log("Created SimpleDB domain.");
});


var afterLogFunc = function(err, logParams){
	if(err) {
		console.log(err);
		console.log(logParams);
		return;
	}
};

var log = function(level, message, details){
	var logParams = {
		DomainName: DB_DOMAIN,
		ItemName: LOG_PREFIX + uuid.v1(),
		Attributes: [
			{
				Name: "timestamp",
				Value: moment().format("YYYY-MM-DD HH:mm:ss.SSS")
			},
			{
				Name: "level",
				Value: level
			},
			{
				Name: "message",
				Value: message
			}
		]
	};
	Object.keys(details).forEach(function(key){
		logParams.Attributes.push({
			Name: key,
			Value: details[key]
		});
	});
	simpledb.putAttributes(logParams,
		function(err, data) {
      console.log(data);
      return afterLogFunc(err, logParams);
    });
};

var getLogs = function(cb){
	simpledb.select({
		SelectExpression: "SELECT * FROM `"+
			DB_DOMAIN +
			"` WHERE timestamp IS NOT NULL ORDER BY timestamp DESC"
	}, function(err, data){
		if(err) {
			return cb(err);
		}
		var out = { raw: data, parsed: [] };
		data.Items.forEach(function(item){
			var entry = { id: item.Name };
			item.Attributes.forEach(function(attr){
				entry[attr.Name] = attr.Value;
			});
			out.parsed.push(entry);
		});
		return cb(null, out);
	});
};

var logInfo  = function(message, details){ return log("info",  message, details); };
var logWarn  = function(message, details){ return log("warn",  message, details); };
var logError = function(message, details){ return log("error", message, details); };

exports.info   	= logInfo;
exports.warning = logWarn;
exports.error   = logError;
exports.getLogs = getLogs;
