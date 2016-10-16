'use strict';

import config from 'config';
import s3 from 'services/s3.js';

/*
 * Usage:
 *
 * GET request
 * ../api/signed_url?file_name=foo&file_type=bar
 *
 * Response
 * {
 *   signed_request,
 *   url,
 * }
 *
 * Use signed_request to make a PUT request to s3
 * headers: 'Content-Type': file.type
 * and the file in the body of request
 *
 */
export function getSignedUrl(req, res, next) {
  const fileName = req.query.file_name;
  const fileType = req.query.file_type;

  if (!fileName || !fileType) {
    next('Missing filename or filetype in query.');
  }

  const returnUrl = `https://${config.aws.s3Bucket}.s3.amazonaws.com/${fileName}`;
  const s3Params = {
    Bucket: config.aws.s3Bucket,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read',
  };

  s3.getSignedUrl('putObject', s3Params, (e, data) => {
    if (e) return next(e);

    const returnData = {
      signed_request: data,
      url: returnUrl,
    };
    res.send(returnData);
  });
}
