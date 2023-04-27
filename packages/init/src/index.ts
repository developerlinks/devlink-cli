import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import { log, inquirer, spinner, Package, exec, createChoices } from '@devlink/cli-utils';
import {
  fetchMaterialsByCollectionGroupId,
  fetchMaterialsByGroupId,
  fetchMyCollectionGroup,
  fetchMyGroups,
} from './fetch';

interface Options {
  targetPath?: string;
  force?: boolean;
  cliHome: string;
}

interface Material {
  name: string;
  npmName: string;
  description: string;
  version: string;
  installCommand?: string;
  startCommand?: string;
  ignore?: string;
  isPrivate: boolean;
  groups: Group[];

  // cli 新加字段
  path?: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
}

async function init(options: Options) {
  try {
    options.targetPath ||= process.cwd();
    log.verbose('init', options);
    await checkCurrentDirEmpty();
    await cleanTargetDirIfNeeded(options);
    const { materials } = await getMaterialsList();
    log.verbose('materialObject', materials);
    const material = await downloadMaterial(materials, options);
    log.verbose('material', material);
    await installDependencies(material, options);
    await startMaterial(material, options);
  } catch (e) {
    log.error('Error:', e.message);
  }
}

async function checkCurrentDirEmpty() {
  let fileList = fs
    .readdirSync(process.cwd())
    .filter(file => !['node_modules', '.git', '.DS_Store'].includes(file));
  log.verbose('fileList', fileList);

  if (
    fileList.length > 0 &&
    !(await inquirer({
      type: 'confirm',
      message: '当前文件夹不为空，是否继续创建物料？',
      defaultValue: false,
    }))
  ) {
    return;
  }
}

async function cleanTargetDirIfNeeded(options: Options) {
  log.verbose('options', options);
  if (options.force) {
    const targetDir = options.targetPath;
    log.verbose('prepare targetDir', targetDir);
    if (
      await inquirer({
        type: 'confirm',
        message: '是否确认清空当下目录下的文件',
        defaultValue: false,
      })
    ) {
      fse.emptyDirSync(targetDir);
      log.verbose('清空目录：', targetDir);
    }
  }
}

async function getMaterialsList() {
  const type = await inquirer({
    choices: [
      { name: '个人分组', value: 'personal' },
      { name: '收藏分组', value: 'collection' },
    ],
    message: '请选择分组类型',
    type: 'list',
  });
  log.verbose('type', type);

  const fetchGroupData = type === 'personal' ? fetchMyGroups : fetchMyCollectionGroup;
  const groups = (await fetchGroupData()).data[type === 'personal' ? 'groups' : 'collectionGroups'];

  if (groups.length === 0) {
    throw new Error(type === 'personal' ? '个人分组获取失败' : '收藏分组获取失败');
  }

  log.verbose('list', { groups });
  const groupId = await inquirer({
    choices: createChoices(groups, 'id', 'name'),
    message: '请选择分组',
    type: 'list',
  });

  log.verbose('groupId', groupId);
  const fetchMaterialsData =
    type === 'personal' ? fetchMaterialsByGroupId : fetchMaterialsByCollectionGroupId;
  const materials = (await fetchMaterialsData(groupId)).data.materials;
  return { materials };
}

async function downloadMaterial(materialList: Material[], options: Options) {
  const materialName = await inquirer({
    choices: createChoices(materialList, 'npmName', 'name'),
    message: '请选择物料',
  });
  log.verbose('material', materialName);
  const selectedMaterial = materialList.find(item => item.npmName === materialName);
  log.verbose('selected material', selectedMaterial);
  const { cliHome } = options;
  const targetPath = path.resolve(cliHome, 'material');
  // 基于物料生成 Package 对象
  const materialPkg = new Package({
    targetPath,
    storePath: targetPath,
    name: selectedMaterial.npmName,
    version: selectedMaterial.version,
  });
  // 如果物料不存在则进行下载
  if (!(await materialPkg.exists())) {
    let spinnerStart = spinner(`正在下载物料...`);
    await materialPkg.install();
    spinnerStart.stop(true);
    log.success('下载物料成功');
  } else {
    log.notice('物料已存在', `${selectedMaterial.npmName}@${selectedMaterial.version}`);
    log.notice('物料路径', `${targetPath}`);
  }

  const materialPath = path.resolve(materialPkg.npmFilePath, 'material');
  log.verbose('material path', materialPath);
  if (!fs.existsSync(materialPath)) {
    throw new Error(`[${materialPkg}]物料不存在！`);
  }

  return { ...selectedMaterial, path: materialPath };
}

async function installDependencies(material: Material, options: Options) {
  const targetDir = options.targetPath!;
  if (material.installCommand) {
    const installCommand = material.installCommand.split(' ');
    log.notice('开始安装依赖');
    await execStartCommand(targetDir, installCommand);
    log.success('依赖安装成功');
  }
}

async function startMaterial(material: Material, options: Options) {
  const targetDir = options.targetPath!;
  if (material.startCommand) {
    const startCommand = material.startCommand.split(' ');
    await execStartCommand(targetDir, startCommand);
  }
}

async function execStartCommand(targetPath: string, startCommand: string[]) {
  return new Promise((resolve, reject) => {
    const p = exec(startCommand[0], startCommand.slice(1), { stdio: 'inherit', cwd: targetPath });
    p.on('error', e => {
      reject(e);
    });
    p.on('exit', c => {
      resolve(c);
    });
  });
}

export default init;
