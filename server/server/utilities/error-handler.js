'use strict';

// error handler for entire application, the last middleware in the chain default to
// internal server error if it hits this and still hasn't sent a response
export default function lastErrorHandler(err, req, res, _) {
  let error = {};
  // default
  if (!err instanceof Error) {
    error = {
      message: 'Internal Server Error',
      status: 500,
    };
  }

  if (typeof err === 'string') {
    error = {
      message: err,
      status: 500,
    };
  }

  if (err instanceof Error) {
    error.status = err.status || 500;
    error.message = err.message || err.toString();
  }

  return res.status(error.status)
  .json({
    message: error.message
  });
}
