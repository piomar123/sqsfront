var aws = require("aws-sdk");
var AwsS3Form = require("aws-s3-form");
var sqs = new aws.SQS();
var _ = require("lodash");
var logger = require("../logic/logger");
var utils = require("../utils");
var CONFIG = require("../config");

exports.showUploadForm = function(request, res, next) {
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
  aws.config.getCredentials(afterCredentialsRefresh);

  function afterCredentialsRefresh(err){
    if(err){
    return next(err);
    }
    console.log("Region:" + aws.config.region);
    var formGen = new AwsS3Form({
      accessKeyId:      aws.config.credentials.accessKeyId,
      secretAccessKey:	aws.config.credentials.secretAccessKey,
      region:           aws.config.region,
      bucket:           CONFIG.S3_BUCKET,
      keyPrefix:        CONFIG.S3_KEY_PREFIX_UPLOAD,
      acl:              "private"
     });

    var metaUploader = { "x-amz-meta-uploader": request.connection.remoteAddress };

    var s3form = formGen.create("${filename}", {
      redirectUrlTemplate: utils.myAddress(request) + "/s3done",
      customConditions: [
        metaUploader
      ]
    });
    s3form.bucket = CONFIG.S3_BUCKET;
    _.extend(s3form.fields, metaUploader);

    res.render("index", {
      ejs: { view: "upload", title: "Upload image" },
      s3form: s3form,
      successFilename: successFilename
    });
  }
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
    logger.info("Image thumbnail request to SQS", logData);
    request.uploadSuccess = true;
    exports.showUploadForm(request, res, next);
  };

  sqs.sendMessage(
    {
      MessageBody: "Request to create image thumbnail.",
      QueueUrl: CONFIG.SQS_URL,
      MessageAttributes: {
        id: { DataType: "String", StringValue: CONFIG.SQS_MSG_ID },
        s3bucket: { DataType: "String", StringValue: request.query.bucket },
        s3key: { DataType: "String", StringValue: request.query.key },
        action: { DataType: "String", StringValue: CONFIG.ACTION_THUMBNAIL }
      }
    }, afterSentToSQS);
};

