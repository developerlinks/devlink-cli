# devlink-cli

开发中，敬请关注！

> 相关项目 [devlink-cli](https://github.com/developerlinks/devlink-cli) 、 [devlink-web](https://github.com/developerlinks/devlink-web) 、[devlink-server](https://github.com/developerlinks/devlink-server)

cli tool for mange materials

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
