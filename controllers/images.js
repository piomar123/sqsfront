var aws = require("aws-sdk");
var s3 = new aws.S3();
var _ = require("lodash");

var S3_BUCKET = "lab4-weeia";
var S3_KEY_PREFIX = "piotr.marcinczyk/project/upload/";

exports.showGallery = function(request, res, next){
  s3.listObjectsV2({
    Bucket: S3_BUCKET,
    Prefix: S3_KEY_PREFIX
  }, afterListedObjects);

  function afterListedObjects(err, data){
    if(err){
      next(err);
    }
    console.log(data.Contents);
    var obj = data.Contents[1];
    var filename = _.last(obj.Key.split("/"));
    var url = s3.getSignedUrl("getObject", {
      Bucket: S3_BUCKET,
      Key: obj.Key
    });
    var thumbs = [
      { name: filename, url: url }
    ];
    res.render("index", {
      ejs: { view: "gallery", title: "Gallery" },
      thumbs: thumbs
    });
  }
};
