# Readme for onetrip server

### prereq

Create secrets.js file in project root dir to export sensitive info.

```
// secrets.js
export default {
  secret: 'topsecret',
  aws: {
    accessKey: '',
    secretKey: '',
    s3Bucket: '',
  },
};
```
