import crypto from 'crypto';

export function generateHash(params) {
  const hash = crypto.createHash('md5');
  const deviceInfoString = JSON.stringify(params).trim();
  hash.update(deviceInfoString);
  return hash.digest('hex');
}
