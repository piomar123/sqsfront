exports.code404handler = function(req, res){
  res.status(404).render("index", {
    ejs: { view: "error404", title: "Not Found 404" },
  });
};
