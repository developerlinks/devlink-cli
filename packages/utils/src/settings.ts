import fs from 'fs';
import chalk from 'chalk';
import { SETTING_INFO_PATH } from './constant';

export interface SettingsIF {
  registry?: string;
  printLogo?: boolean;
}

export function setSettings(settings: object): void {
  const settingsInfo = getSettings();
  const newSettingsInfo = Object.assign(settingsInfo, settings);
  fs.writeFileSync(SETTING_INFO_PATH, JSON.stringify(newSettingsInfo));
  // 显示当前的配置
  console.log(chalk.green(`设置成功`));
  showSettings();
}

// 清除配置
export function clearSettings(): void {
  fs.writeFileSync(SETTING_INFO_PATH, '{}');
  console.log(chalk.green(`清除成功`));
}

// 查看当前配置
export function getSettings(): SettingsIF {
  const settingsFilePath = SETTING_INFO_PATH;
  const settingsExist = fs.existsSync(settingsFilePath);

  return settingsExist ? JSON.parse(fs.readFileSync(settingsFilePath, 'utf8')) : {};
}

export function showSettings(): void {
  const settingsInfo = getSettings() as SettingsIF;
  printSettings(settingsInfo);
}

function printSettings(settingsInfo: SettingsIF): void {
  console.log();
  console.log(chalk.green(`当前设置：`));
  console.log(chalk.green(`npm源：${settingsInfo.registry}`));
  console.log(chalk.green(`是否打印logo：${settingsInfo.printLogo}`));
}
