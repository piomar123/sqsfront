var aws = require("aws-sdk");
var AwsS3Form = require("aws-s3-form");
var sqs = new aws.SQS();
var fs = require("fs");
var _ = require("lodash");
var logger = require("../logic/logger");

var AWS_CONFIG_FILE = "./config.json";
var S3_BUCKET = "lab4-weeia";
var S3_KEY_PREFIX = "piotr.marcinczyk/project/upload/";

var SQS_MESSAGE_TEXT = "Request to create image thumbnail.";
var SQS_URL = "https://sqs.us-west-2.amazonaws.com/983680736795/MarcinczykSQS";
var SQS_MSG_ID = "S3projSQS";
var ACTION_THUMBNAIL = "thumbnail";

if(!fs.existsSync(AWS_CONFIG_FILE)) {
	throw new Error("Unable to read config file: " + AWS_CONFIG_FILE);
}
var awsConfig = JSON.parse(fs.readFileSync(AWS_CONFIG_FILE, { encoding:"utf8" }));

exports.showUploadForm = function(request, res) {
  var successFilename = null;
  if(request.uploadSuccess === true){
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

exports.s3uploadDone = function(request, res, next){
  logger.info("S3 file uploaded", {
    client: request.connection.remoteAddress,
    host: request.hostname,
    s3bucket: request.query.bucket,
    s3key: request.query.key
  });

  console.log(request.query);

  var afterSentToSQS = function(err){
    if(err){
      next(err);
    }
    var logData = {
      client: request.connection.remoteAddress,
      host: request.hostname,
      s3bucket: request.query.bucket,
      s3key: request.query.key
    };
    logger.info("Uploaded image thumbnail request to SQS", logData);
    request.uploadSuccess = true;
    exports.showUploadForm(request, res, next);
  };

  sqs.sendMessage(
    {
      MessageBody: SQS_MESSAGE_TEXT,
      QueueUrl: SQS_URL,
      MessageAttributes: {
        id: { DataType: "String", StringValue: SQS_MSG_ID },
        s3bucket: { DataType: "String", StringValue: request.query.bucket },
        s3key: { DataType: "String", StringValue: request.query.key },
        action: { DataType: "String", StringValue: ACTION_THUMBNAIL }
      }
    }, afterSentToSQS);
};

