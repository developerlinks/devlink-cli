import fs from 'fs';
import { SpinnerInstance, request, log, constant } from '@devlink/cli-utils';

export async function logout() {
  const spinnerInstance = SpinnerInstance('退出登录中');
  spinnerInstance.start();
  try {
    if (fs.existsSync(constant.USER_INFO_PATH)) {
      const userInfo = JSON.parse(fs.readFileSync(constant.USER_INFO_PATH, 'utf8'));
      console.log('userInfo', userInfo.access_token);
      await request.get('/auth/logout', {
        headers: { Authorization: `Bearer ${userInfo.access_token}` },
      });
      fs.unlinkSync(constant.USER_INFO_PATH);
      spinnerInstance.stop(true);
      log.success(`${userInfo.user.username} 退出成功`);
    } else {
      spinnerInstance.stop(true);
      log.error('退出失败', '未登录');
    }
  } catch (error) {
    spinnerInstance.stop(true);
    console.error('退出失败', error.message);
  }
}
