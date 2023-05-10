import { setSettings } from '@devlink/cli-utils';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface Settings {
  registry?: string;
  printLogo?: boolean;
}

export async function customizeSettings(): Promise<void> {
  const mainChoices = ['npm源', '是否打印logo'];

  const mainAnswer = await inquirer.prompt<{ mainSetting: string }>([
    {
      type: 'list',
      name: 'mainSetting',
      message: '请选择要更改的配置：',
      choices: mainChoices,
    },
  ]);

  switch (mainAnswer.mainSetting) {
    case 'npm源':
      await customizeNpmSource();
      break;
    case '是否打印logo':
      await customizePrintLogo();
      break;
  }
}

async function customizeNpmSource(): Promise<void> {
  const npmSourceChoices = ['npm', 'taobao'];

  const npmSourceAnswer = await inquirer.prompt<{ registry: string }>([
    {
      type: 'list',
      name: 'registry',
      message: '请选择 npm 源：',
      choices: npmSourceChoices,
    },
  ]);

  const settings: Settings = {
    registry: npmSourceAnswer.registry,
  };

  console.log(chalk.green(`已选择 ${npmSourceAnswer.registry} 作为 npm 源。`));
  setSettings(settings);
}

async function customizePrintLogo(): Promise<void> {
  const printLogoAnswer = await inquirer.prompt<{ printLogo: boolean }>([
    {
      type: 'confirm',
      name: 'printLogo',
      message: '是否打印 logo？',
      default: true,
    },
  ]);
  const settings: Settings = {
    printLogo: printLogoAnswer.printLogo,
  };
  console.log(chalk.green(`已设置打印 logo 为 ${settings.printLogo ? '开' : '关'}。`));
  setSettings(settings);
}
