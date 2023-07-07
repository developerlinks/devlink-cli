import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import { Command } from 'commander';
import chalk from 'chalk';
import { homedir } from 'os';
import semver from 'semver';
import { login, logout, whoami } from '@devlink/cli-auth';
import {
  log,
  Package,
  exec,
  getLatestVersion,
  getNpmLatestSemverVersion,
  constant,
  getSettings,
  clearSettings,
  showSettings,
  spinner,
} from '@devlink/cli-utils';
import packageConfig from '../package.json';
import { customizeSettings } from './settingsHandler';
import { embeddingCode, llmConfig } from '@devlink/ai';

interface Config {
  cliHome: string;
  registry?: string;
  printLogo?: boolean;
}

interface ExtraOptionsIF {
  type?: string;
  force?: boolean;
}

let config: Config;
let args;

export default async function cli(): Promise<void> {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    log.error('pre', e.message);
  }
}

function registerCommand() {
  const program = new Command();
  program.version(packageConfig.version).usage('<command> [options]');

  program
    .command('init [type]')
    .description('物料初始化')
    .option('--packagePath <packagePath>', '手动指定init包路径')
    .option('--force', '覆盖当前路径文件（谨慎使用）')
    .action(async (type, { packagePath, force }) => {
      const packageName = '@devlink/cli-init';
      const packageVersion = await getLatestVersion(packageName);
      await executePackageCommand({ packagePath, packageName, packageVersion }, { type, force });
    });

  program
    .command('login')
    .description('登录')
    .action(async () => {
      await login();
    });

  program
    .command('logout')
    .description('退出')
    .action(async () => {
      await logout();
    });

  program
    .command('whoami')
    .description('查询个人信息')
    .action(async () => {
      const userInfo = await whoami();
      log.notice('用户名', userInfo.user.username);
      log.notice('邮箱', userInfo.user.email);
      log.verbose('用户信息', userInfo);
    });

  program
    .command('settings')
    .description('个性化配置')
    .option('-c, --clear', '清除配置')
    .option('-s, --show', '查看配置')
    .option('-e, --edit', '编辑配置')
    .action(async options => {
      if (options.clear) {
        clearSettings();
      } else if (options.show) {
        showSettings();
      } else if (options.edit) {
        customizeSettings();
      } else {
        printSettingsHelp('settings');
      }
    });

  program
    .command('ai')
    .description('ai')
    .option('-e, --explainCode', '解释代码含义')
    .option('-p, --path <path>', '代码目录')
    .option('-f, --fileTypes <fileTypes>', '代码类型')
    .option('-pt, --prompt <prompt>', 'prompt')
    .action(handleExplainCodeCommand);

  async function handleExplainCodeCommand(options) {
    try {
      const { path, fileTypes, prompt } = options;
      const openAIApiKey = process.env.OPENAI_API_KEY;
      const fileTypeArray = fileTypes.split(',');

      if (!path || !fileTypeArray.length || !openAIApiKey) {
        log.error(
          'Invalid arguments. Please make sure the path, file types, and OpenAI API key are provided.',
        );
        return;
      }
      const fileSpinnerStart = spinner('分析文件中～');
      const openAIConfig: llmConfig = {
        openAIApiKey,
      };
      const openAIEmbeddingConfig: llmConfig = {
        openAIApiKey,
      };
      const { agent } = await embeddingCode({
        directoryPath: path,
        fileTypeArray,
        openAIConfig,
        openAIEmbeddingConfig,
      });
      fileSpinnerStart.stop(true);
      const input = prompt ?? 'Explain the meaning of these codes step by step.';
      log.notice(`Executing: ${input}`);
      const execSpinnerStart = spinner('推理中～');
      const result = await agent.call({ input });
      execSpinnerStart.stop(true);
      log.success(`Got output: ${result.output}`);
    } catch (error) {
      log.error(`An error occurred while executing the command: ${error.message}`);
    }
  }

  program
    .command('clean')
    .description('清空缓存文件')
    .option('-a, --all', '清空全部')
    .option('-d, --dep', '清空依赖文件')
    .action(options => {
      log.notice('开始清空缓存文件');
      if (options.all) {
        cleanAll();
      } else if (options.dep) {
        const depPath = path.resolve(config.cliHome, constant.DEPENDENCIES_PATH);
        if (fs.existsSync(depPath)) {
          fse.emptyDirSync(depPath);
          log.success('清空依赖文件成功', depPath);
        } else {
          log.success('文件夹不存在', depPath);
        }
      } else {
        cleanAll();
      }
    });

  program.option('--debug', '打开调试模式').parse(process.argv);

  if (args._.length < 1) {
    program.outputHelp();
    console.log();
  }

  function printSettingsHelp(settingsCommand: string) {
    const command = program.commands.find(cmd => cmd.name() === settingsCommand);
    if (!command) {
      console.error(`${settingsCommand} command not found.`);
      return;
    }

    console.log(command.helpInformation());
  }
}

async function executePackageCommand(
  { packagePath, packageName, packageVersion },
  extraOptions: ExtraOptionsIF,
) {
  try {
    const packageInstance = await getPackageInstance({ packagePath, packageName, packageVersion });

    if (!packagePath) {
      await installOrUpdatePackage(packageInstance);
    }

    const rootFile = packageInstance.getRootFilePath(packagePath !== undefined);

    if (fs.existsSync(rootFile)) {
      const _config = Object.assign({}, config, extraOptions);
      runCodeFromPackage(rootFile, _config);
    } else {
      throw new Error('入口文件不存在，请重试！');
    }
  } catch (e) {
    log.error('executePackageCommand', e.message);
  }
}

async function getPackageInstance({ packagePath, packageName, packageVersion }) {
  if (packagePath) {
    return new Package({
      targetPath: packagePath,
      storePath: packagePath,
      name: packageName,
      version: packageVersion,
    });
  } else {
    const { cliHome } = config;
    const packageDir = `${constant.DEPENDENCIES_PATH}`;
    const targetPath = path.resolve(cliHome, packageDir);
    const storePath = path.resolve(targetPath, 'node_modules');
    return new Package({
      targetPath,
      storePath,
      name: packageName,
      version: packageVersion,
    });
  }
}

async function installOrUpdatePackage(packageInstance) {
  if (await packageInstance.exists()) {
    log.notice('更新 package');
    await packageInstance.update();
  } else {
    log.notice('安装 package');
    await packageInstance.install();
  }
}

function runCodeFromPackage(rootFile, _config) {
  const code = `const { default: init } = require('${rootFile}'); init(${JSON.stringify(
    _config,
  )});`;

  const p = exec('node', ['-e', code.replace(/\n/g, '')], { stdio: 'inherit' });
  p.on('error', e => {
    log.verbose('命令执行失败：', e);
    handleError(e);
    process.exit(1);
  });
  p.on('exit', c => {
    log.verbose('命令执行成功', c);
    process.exit(c);
  });
}

function handleError(e) {
  log.error('Error', e.message);
  log.error('stack', e.stack);
  process.exit(1);
}

function cleanAll() {
  if (fs.existsSync(config.cliHome)) {
    fse.emptyDirSync(config.cliHome);
    log.success('清空全部缓存文件成功', config.cliHome);
  } else {
    log.success('文件夹不存在', config.cliHome);
  }
}

async function prepare() {
  checkEnv(); // 检查环境变量
  config?.printLogo ? printLogo() : null;
  checkNodeVersion(); // 检查 node 版本
  checkRoot(); // 检查是否为 root 启动
  checkUserHome(); // 检查用户主目录
  checkInputArgs(); // 检查用户输入参数
  await checkGlobalUpdate(); // 检查工具是否需要更新
}

async function checkGlobalUpdate() {
  log.verbose('检查 @devlink/cli 最新版本');
  const currentVersion = packageConfig.version;
  const lastVersion = await getNpmLatestSemverVersion(constant.NPM_NAME, currentVersion);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      chalk.yellow(`请手动更新 ${constant.NPM_NAME}，当前版本：${packageConfig.version}，最新版本：${lastVersion}
                更新命令： npm install -g ${constant.NPM_NAME}`),
    );
  }
}

function checkEnv() {
  log.verbose('开始检查环境变量');
  const dotenv = require('dotenv');
  dotenv.config({
    path: path.resolve(homedir(), '.env'),
  });
  config = createCliConfig(); // 准备基础配置
  log.verbose('环境变量', config);
}

const createCliConfig = () => {
  const cliHome = process.env.CLI_HOME
    ? path.join(homedir(), process.env.CLI_HOME)
    : path.join(homedir(), constant.DEFAULT_CLI_HOME);

  const settings = getSettings();

  return { ...settings, cliHome };
};

function checkInputArgs() {
  log.verbose('开始校验输入参数');
  const minimist = require('minimist');
  args = minimist(process.argv.slice(2)); // 解析查询参数
  checkArgs(args); // 校验参数
  log.verbose('输入参数', args);
}

function checkArgs(args) {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
}

function checkUserHome() {
  if (!homedir() || !fs.existsSync(homedir())) {
    throw new Error(chalk.red('当前登录用户主目录不存在！'));
  }
}

function checkRoot() {
  const rootCheck = require('root-check');
  log.verbose('开始检查 root 权限');
  rootCheck(chalk.red('请避免使用 root 账户启动本应用'));
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  log.verbose('开始检查 Node 版本');
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      chalk.red(
        `devlink-cli 需要 Node.js ${lowestVersion} 以上版本，您当前的 Node.js 版本为 ${currentVersion}。`,
      ),
    );
  }
}

function printLogo() {
  console.info(
    `
      ██████╗ ███████╗██╗   ██╗██╗     ██╗███╗   ██╗██╗  ██╗  
      ██╔══██╗██╔════╝██║   ██║██║     ██║████╗  ██║██║ ██╔╝  
      ██║  ██║█████╗  ██║   ██║██║     ██║██╔██╗ ██║█████╔╝   
      ██║  ██║██╔══╝  ╚██╗ ██╔╝██║     ██║██║╚██╗██║██╔═██╗   
      ██████╔╝███████╗ ╚████╔╝ ███████╗██║██║ ╚████║██║  ██╗  
      ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
                                                    version: ${packageConfig.version}
    `,
  );
}
