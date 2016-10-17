'use strict';

import config from 'config.js';
import path from 'path';
import debug from 'debug';

export function debugWrapper(tag) {
  const newTag = path.basename(tag);
  return debug(`${config.debugTag}:${newTag}`);
}
