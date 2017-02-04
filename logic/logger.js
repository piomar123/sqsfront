var aws = require("aws-sdk");
var uuid = require("uuid");
var moment = require("moment");
var CONFIG = require("../config");

var simpledb = new aws.SimpleDB();

simpledb.createDomain({ DomainName: CONFIG.DB_DOMAIN }, function(err, data) {
	/* jshint unused:vars */
	if(err) {
		console.log(err, err.stack);
		return;
	}
	console.log("Created SimpleDB domain.");
});

var afterLogFunc = function(err, logParams, message){
	if(err) {
		console.log(err);
		console.log(logParams);
		return;
	}
	console.log(message);
};

var log = function(level, message, details){
	var logParams = {
		DomainName: CONFIG.DB_DOMAIN,
		ItemName: CONFIG.LOG_PREFIX + uuid.v1(),
		Attributes: []
	};
	details.timestamp = moment.utc().format("YYYY-MM-DD HH:mm:ss.SSS");
	details.level = level;
	details.message = message;
	details.module = "frontend";
	Object.keys(details).forEach(function(key){
		logParams.Attributes.push({
			Name: key,
			Value: details[key]
		});
	});
	simpledb.putAttributes(logParams,
		function(err /*, data*/) {
      return afterLogFunc(err, logParams, message);
    });
};

var getLogs = function(cb, query){
	query = query || {};
	simpledb.select({
		SelectExpression: "SELECT * FROM `"+
			CONFIG.DB_DOMAIN +
			"` WHERE timestamp IS NOT NULL " +
			(query.debug !== undefined ? "" : " AND level != 'debug'") +
			" ORDER BY timestamp DESC"
	}, function(err, data){
		if(err) {
			return cb(err);
		}
		var out = { raw: data, parsed: [] };
		if(!data.Items){
			return cb(null, out);
		}
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
