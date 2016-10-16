'use strict';

import auth from './auth';
import users from '../controllers/users';
import resource from '../controllers/resource';
import plan from '../controllers/plan';
import spots from '../controllers/spot';
import guide from '../controllers/guide';
import quote from '../controllers/quote';
import errorHandler from '../utilities/error-handler.js';
// import * as s3 from '../controllers/s3.js';
// import path from 'path';
// import multer from 'multer';
// import crypto from 'crypto';
// import mime from 'mime';

// var storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, path.join(__dirname, '../../public/images/uploads'));
//   },
//   filename: function(req, file, cb) {
//     crypto.pseudoRandomBytes(16, function(err, raw) {
//       cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
//     });
//   }
// });

// var upload = multer({
//   storage,
// });

// var upload = multer({
//   dest: path.join(__dirname, '../../public/images/uploads'),
//   filename: function (req, file, cb) {
//     crypto.pseudoRandomBytes(16, function (err, raw) {
//       console.log(file);
//       cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
//     });
//   }
// })

export default function initRoutes(app) {
  app.route('/api').get(function(req, res) {
    res.status(200).send('hi');
  });

  app.get('/api/cities', resource.getCities);
  app.get('/api/allguides', resource.getGuides);
  app.get('/api/allspots', resource.getSpots);
  app.get('/api/allusers', resource.getUsers);

  app.post('/api/quote', quote.getQuote);
  app.post('/api/spots', spots.getSpots);

  app.get('/api/guide_info', resource.getGuides);

  app.post('/api/plan', plan.getPlan);

  app.post('/api/guide_add', resource.addGuide);

  // app.post('/api/upload', upload.single('file'), function(req, res) {
  //     var file = req.file;
  //     console.log(file);
  //     console.log(req.file.filename);
  // });
  app.get('/api/guide_book', guide.bookGuide);
  app.post('/api/find_guide', guide.findGuide);

  app.get('/api/signed_url', s3.getSignedUrl);

  // app.get('/api/guide', auth.requiresApiLogin, guide.getGuide);
  // app.get('/api/user_info', auth.requiresApiLogin, users.getUser);

  // app.get('/api/user_info', auth.requiresRole('admin'), users.getUser);

  app.post('/signup', users.createUser);
  // app.put('/api/users', users.updateUser);

  // app.get('/api/courses', courses.getCourses);

  app.post('/login', auth.authenticate);

  app.post('/logout', function(req, res) {
    req.logout();
    res.end();
  });

  app.get('*', function(req, res) {
    res.status(400).send('api not exist');
  });

  app.use(errorHandler);
}
