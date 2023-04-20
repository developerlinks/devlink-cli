import fs from 'fs';
import inquirer from 'inquirer';
import { constant, log, request, spinner } from '@devlink/cli-utils';

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
  const spinnerStart = spinner('登录中～');

  try {
    const response = await request.post('/auth/signin_by_password', { email, password });
    fs.writeFileSync(constant.USER_INFO_PATH, JSON.stringify(response.data));
    spinnerStart.stop(true);
    log.success(`${response.data.user.username} 登录成功`);
  } catch (error) {
    spinnerStart.stop(true);
    log.error('登录失败', error.message);
  }
}
