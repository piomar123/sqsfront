var aws = require("aws-sdk");
var s3 = new aws.S3();
var _ = require("lodash");
var CONFIG = require("../config");

exports.showGallery = function(request, res, next){
  s3.listObjectsV2({
    Bucket: CONFIG.S3_BUCKET,
    Prefix: CONFIG.S3_KEY_PREFIX_THUMBS
  }, afterListedObjects);

  function afterListedObjects(err, data){
    if(err){
      next(err);
    }
    console.log(data.Contents);
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
      thumbs: thumbs
    });
  }
};

exports.showImage = function(request, res, next){
  var s3key = CONFIG.S3_KEY_PREFIX_UPLOAD + request.params.key;
  var url = s3.getSignedUrl("getObject", {
    Bucket: CONFIG.S3_BUCKET,
    Key: s3key
  });
  if(!url){
    return next();
  }
  res.redirect(303, url);
};

exports.processImages = function(request, res, next){
  console.log(request.body.images);
  console.log(request.body.operations);
  request.body.images.forEach(function(entry){

  });
  return next();
};
