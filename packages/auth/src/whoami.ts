import fs from 'fs';
import { constant, log } from '@devlink/cli-utils';

export async function whoami() {
  if (fs.existsSync(constant.USER_INFO_PATH)) {
    const userInfo = JSON.parse(fs.readFileSync(constant.USER_INFO_PATH, 'utf8'));
    return userInfo;
  } else {
    log.error('尚未登录，请先登录。');
  }
}
