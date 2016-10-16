var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');

module.exports = {
  development: {
    db: 'mongodb://localhost/traveller',
    rootPath: rootPath,
    port: process.env.PORT || 3003
  },
  production: {
    rootPath: rootPath,
    // db: 'mongodb://jeames:multivision@ds053178.mongolab.com:53178/multivision',
    port: process.env.PORT || 80
  }
}