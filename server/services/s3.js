'use strict';

import secrets from 'secrets.js';
import aws from 'aws-sdk';

aws.config.update({
  accessKeyId: secrets.aws.accessKey,
  secretAccessKey: secrets.aws.secretKey,
});

const s3 = new aws.S3();

export default s3;
