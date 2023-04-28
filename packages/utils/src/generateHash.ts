import crypto from 'crypto';

export function generateHash(params) {
  const hash = crypto.createHash('md5');
  const paramsString = JSON.stringify(params).trim();
  hash.update(paramsString);
  return hash.digest('hex');
}
