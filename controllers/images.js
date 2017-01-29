var aws = require("aws-sdk");
var s3 = new aws.S3();
var _ = require("lodash");
var CONFIG = require("../config");

exports.showGallery = function(request, res, next){
  s3.listObjectsV2({
    Bucket: CONFIG.S3_BUCKET,
    Prefix: CONFIG.S3_KEY_PREFIX_UPLOAD
  }, afterListedObjects);

  function afterListedObjects(err, data){
    if(err){
      next(err);
    }
    console.log(data.Contents);
    var obj = data.Contents[2];
    var filename = _.last(obj.Key.split("/"));
    var url = s3.getSignedUrl("getObject", {
      Bucket: CONFIG.S3_BUCKET,
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
