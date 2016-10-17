var multer  = require('multer');


// var upload = multer({ storage: storage })



var upload = multer({
  dest: './public/images/uploads/',
  rename: function () {
        var now = new Date();
        return now.getFullYear() +
            ( '0' + (now.getMonth() + 1) ).slice(-2) +
            ( '0' + now.getDate() ).slice(-2) +
            ( '0' + now.getHours() ).slice(-2) +
            ( '0' + now.getMinutes() ).slice(-2) +
            ( '0' + now.getSeconds() ).slice(-2) +
            parseInt(10000 + Math.random() * 90000);
  },
  limits: {
    fieldNameSize: 100,
    fileSize: 1024*1024,
    files: 1
  }
});




exports.getfile = function(req, res){
	console.log(req);

}