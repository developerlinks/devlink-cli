import path from 'path';
import userHome from 'user-home';
import formatPath from './formatPath';

export const LOWEST_NODE_VERSION = '11.0.0';
export const DEFAULT_CLI_HOME = '.devlink-cli';
export const NPM_NAME = '@devlink/cli';
export const DEPENDENCIES_PATH = 'dependencies';
export const SETTING_PATH = 'setting.json';
export const USER_INFO = 'userInfo.json';
export const USER_INFO_PATH = formatPath(path.join(userHome, DEFAULT_CLI_HOME, USER_INFO));
