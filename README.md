# devlink-cli

开发中，敬请关注！

> 相关项目 [devlink-cli](https://github.com/developerlinks/devlink-cli) 、 [devlink-web](https://github.com/developerlinks/devlink-web) 、[devlink-server](https://github.com/developerlinks/devlink-server)

cli tool for mange materials

```shell
 ~ devlink
Usage: devlink <command> [options]

Options:
  -V, --version          output the version number
  --debug                打开调试模式
  -h, --help             display help for command

Commands:
  init [options] [type]  物料初始化
  login                  登录
  logout                 退出
  whoami                 查询个人信息
  settings [options]     个性化配置
  clean [options]        清空缓存文件
  help [command]         display help for command
```

![devlink](https://qiniuyun.devlink.wiki/0e1bf62a2aae0b264a340da3e603f44fc7223a1e0e363b54cb4a2fe4a6655953.png)

## Feature

## Start

```bash
npm install -g @devlink/cli

or

yarn global add @devlink/cli

```

## Create project

Select the project you want to initialize through the command line

```bash
devlink init
```

Force empty current directory

```bash
devlink init --force
```

## Other API

clear cache

The templates downloaded by the scaffolding will be cached locally for faster initialization for the second time. If some impact is caused by this, you can manually delete the cache.

```bash
devlink clean
```

debug

In debug mode, you can view more installation information to troubleshoot errors

```bash
devlink --debug
```

> If you want to add your template, please write your warehouse address in pr

## debug

### init

such as

```bash
devlink init --packagePath /Users/bowling/code/devlinks/devlink-cli/packages/init --debug
```
