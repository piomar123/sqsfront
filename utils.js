exports.myAddress = function(request){
	return request.protocol + "://" + request.get("host");
};
