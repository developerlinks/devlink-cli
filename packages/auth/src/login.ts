import fs from 'fs';
import os from 'os';
import inquirer from 'inquirer';
import { constant, generateHash, log, request, SpinnerInstance } from '@devlink/cli-utils';

export interface LoginByPasswordParams {
  email: string;
  password: string;
  deviceId: string;
  deviceType: string;
}

export async function login() {
  const questions = [
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
    },
  ];

  const { email, password } = await inquirer.prompt(questions);
  const spinnerInstance = SpinnerInstance('登录中');
  spinnerInstance.start();
  // 根据 os 获取设备信息

  const { deviceId, deviceType } = getDeviceInfo(email);

  const loginParams: LoginByPasswordParams = {
    email,
    password,
    deviceId,
    deviceType,
  };

  try {
    const response = await request.post('/auth/signin_by_password', loginParams);
    fs.writeFileSync(constant.USER_INFO_PATH, JSON.stringify(response.data));
    spinnerInstance.stop(true);
    log.success(`${response.data.user.username} 登录成功`);
  } catch (error) {
    spinnerInstance.stop(true);
    log.error('登录失败', error.message);
  }
}

function getDeviceInfo(email: string) {
  let deviceType = 'command:unknown';

  const deviceInfo = {
    os: os.type(),
    osVersion: os.release(),
    userName: os.userInfo().username,
    hostname: os.hostname(),
    email,
  };

  const deviceId = generateHash(deviceInfo);

  // 获取操作系统信息
  const platform = deviceInfo.os;
  if (platform === 'Win32') {
    deviceType = 'command:Windows';
  } else if (platform === 'Darwin') {
    deviceType = 'command:MacOS';
  } else if (platform === 'Linux') {
    deviceType = 'command:Linux';
  }
  return {
    deviceId,
    deviceType,
  };
}
