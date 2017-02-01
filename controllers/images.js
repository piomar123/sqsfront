var aws = require("aws-sdk");
var s3 = new aws.S3();
var sqs = new aws.SQS();
var async = require("async");
var _ = require("lodash");
var CONFIG = require("../config");

exports.showGallery = function(request, res, next){
  s3.listObjectsV2({
    Bucket: CONFIG.S3_BUCKET,
    Prefix: CONFIG.S3_KEY_PREFIX_THUMBS
  }, afterListedObjects);

  function afterListedObjects(err, data){
    if(err){
      return next(err);
    }
    // console.log(data.Contents);
    aws.config.getCredentials(afterCredentialsRefresh);

    function afterCredentialsRefresh(err) {
      if(err){
        return next(err);
      }
      var thumbs = [];
      data.Contents.forEach(function(obj){
        var filename = _.last(obj.Key.split("/"));
        if(!filename) return;
        var thumb = s3.getSignedUrl("getObject", {
          Bucket: CONFIG.S3_BUCKET,
          Key: obj.Key
        });
        thumbs.push({ name: filename, thumb: thumb });
      });
      res.render("index", {
        ejs: { view: "gallery", title: "Gallery" },
        thumbs: thumbs,
        actions: CONFIG.ACTIONS,
        previousSuccess: request.requestSuccess,
        removedImages: request.removedImages
      });
    }
  }
};

exports.showImage = function(request, res, next){
  var s3key = CONFIG.S3_KEY_PREFIX_UPLOAD + request.params.key;
  s3.getSignedUrl("getObject", {
    Bucket: CONFIG.S3_BUCKET,
    Key: s3key
  }, function(err, url) {
    if(err){
      return next(err);
    }
    res.redirect(303, url);
  });
};

exports.processImages = function(request, res, next){
  console.log(request.body.images);
  if(!request.body.images){
    return next(new Error("Images not specified."));
  }
  if(request.body.remove){
    var toDelete = [];
    request.body.images.forEach(function(img){
      toDelete.push({ Key: CONFIG.S3_KEY_PREFIX_UPLOAD + img });
      toDelete.push({ Key: CONFIG.S3_KEY_PREFIX_THUMBS + img });
    });
    s3.deleteObjects({
      Bucket: CONFIG.S3_BUCKET,
      Delete: {
        Objects: toDelete
      }
    }, function(err){
      if(err){
        return next(err);
      }
      request.removedImages = request.body.images.length;
      exports.showGallery(request, res, next);
    });
    return;
  }

  if(!request.body.actions){
    return next(new Error("No actions specified."));
  }
  console.log(request.body.actions);
  async.forEach(request.body.images, function(img, done){
    async.forEach(request.body.actions, function(action, done){
      sqs.sendMessage(
        {
          MessageBody: "Request to process image.",
          QueueUrl: CONFIG.SQS_URL,
          MessageAttributes: {
            id: { DataType: "String", StringValue: CONFIG.SQS_MSG_ID },
            s3bucket: { DataType: "String", StringValue: CONFIG.S3_BUCKET },
            s3key: { DataType: "String", StringValue: CONFIG.S3_KEY_PREFIX_UPLOAD + img },
            action: { DataType: "String", StringValue: action }
          }
        }, done);
    }, done);
  }, function(err) {
    if(err){
      return next(err);
    }
    request.requestSuccess = true;
    exports.showGallery(request, res, next);
  });
};
