//var aws = require("aws-sdk");
var AwsS3Form = require("aws-s3-form");
var fs = require("fs");
var _ = require("lodash");
var logger = require("../logic/logger");

var AWS_CONFIG_FILE = "./config.json";
var S3_BUCKET = "lab4-weeia";
var S3_KEY_PREFIX = "piotr.marcinczyk/project/upload/";

if(!fs.existsSync(AWS_CONFIG_FILE)) {
	throw new Error("Unable to read config file: " + AWS_CONFIG_FILE);
}
var awsConfig = JSON.parse(fs.readFileSync(AWS_CONFIG_FILE, { encoding:"utf8" }));

exports.showUploadForm = function(request, res, uploaded) {
  var successFilename = null;
  if(uploaded === true){
    var filename = _.last(request.query.key.split("/"));
    successFilename = filename;
  } else {
    logger.info("S3 upload form requested", {
      client: request.connection.remoteAddress,
      host: request.hostname
    });
  }

  var myAddress = request.protocol + "://" + request.get("host");
  var formGen = new AwsS3Form({
    accessKeyId:      awsConfig.accessKeyId,
    secretAccessKey:	awsConfig.secretAccessKey,
    region:           awsConfig.region,
    bucket:           S3_BUCKET,
    keyPrefix:        S3_KEY_PREFIX,
    acl:              "private"
  });

  var metaUploader = { "x-amz-meta-uploader": request.connection.remoteAddress };

  var s3form = formGen.create("${filename}", {
    redirectUrlTemplate: myAddress + "/s3done",
    customConditions: [
      metaUploader
    ]
  });
  s3form.bucket = S3_BUCKET;
  _.extend(s3form.fields, metaUploader);

  res.render("index", {
    ejs: { view: "upload", title: "Upload image" },
    s3form: s3form,
    successFilename: successFilename
  });
};

exports.s3uploadDone = function(request, res){
  logger.info("S3 file uploaded", {
    client: request.connection.remoteAddress,
    host: request.hostname,
    s3bucket: request.query.bucket,
    s3key: request.query.key
  });

  console.log(request.query);
  exports.showUploadForm(request, res, true);
};

