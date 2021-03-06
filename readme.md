# 部署

从本仓库中选择 tag 后下载对应的发布版本, 确保 `Node.js` 版本高于 `16.7.0` 建议使用最新的 LTS 版本.

执行 `pnpm install` 或者 `npm install`, 建议使用 `pnpm` 本项目使用 `pnpm` 作为包管理器, 使用 `pnpm` 安装不会产生依赖问题.

# 启动

启动需要配置临时环境变量, 下面给出的是基于 `powershell` 的语法, 其他平台需要自行替换为对应的语法.

## 生产环境

```pwsh
$env:NODE_ENV="production";node .\dist\daemon.mjs
```

## 日志记录

只建议调试情况下使用, 这样做会大幅降低性能.

```pwsh
$env:DEBUG="*";node .\dist\daemon.mjs
```

## 启动参数(gitlab 支持)

额外参数用于扫描 gitlab 仓库, 根据分支的命名规则, 来自动移除不需要的 `app` 和 `api` 服务, 扫描周期为每日一次, 不传入则不进行服务裁剪.

参数由三个部分组成使用 `@` 作为分隔符:

```
<gitlab服务地址>@<项目ID>@<ACCESS_TOKEN>
```

例子:

```
$env:NODE_ENV="production";node .\dist\daemon.mjs http://192.168.0.1:8080@1234@xxxxx http://192.168.0.1:8080@2222@xxxxx
```

# 配置文件

配置文件存放在 `config` 目录下.

## config

```json
{
  "daemon": {
    "port": 2793 // 守护进程监听端口
  },
  "server": {
    "port": 80, // 转发服务器端口
    "fallbackPrefix": "dev", // api 服务回退标识
    "portBottomLine": 3000, // 基于标识计算端口号时候的起始端口值
    "passthroughPrefixes": ["/api"] // 透传到 API 服务的路由前缀
  }
}
```

## manifest

**注意**: 如果首次使用中需要手动配置此文件, 你需要手动建立此文件.

这个文件描述了 API 服务以及对应的地址, 在首次启动的情况下, 在配置完成 `config.server.fallbackPrefix` 后你需要在这里指定对应的地址, 这个环节也可以在守护进程提供的在线配置页面中完成.

在这个配置中, 键代表 API 标识, 值对应的是地址.

例子:

```json
{
  "dev": "http://192.169.0.1:8080"
}
```

# 工作方式

守护进程会唤醒工作进程, 守护进程读取配置文件提供在线的配置页面, 当配置发生变化时重启工作进程服务器.

工作进程服务器根据请求中携带的 `cookie` 来判断响应的**应用(app)**以及转发的**接口(api)**, 而转发的目的地是通过守护进程配置的.

这个 `cookie` 不需要手动编辑, 它的格式如下:

```
完整语法:
<projectName>@<API>[@channel]

无通道例子:
projectName@dev
projectName@test
projectName@pre-release

有通道例子:
projectName@dev@bug-123
projectName@test@office
projectName@test@admin
projectName@pre-release@next
```

![示意图](./docs/example.png)

# 使用方式

守护进程除了提供了一个配置页面外, 还提供了一组 `restful` API 以供脚本调用, 一般是结合代码托管工具使用, 在合适的时机调用 api 以及 app 的注册服务, 并在合适的时机调用 api 以及 app 的删除服务.

在此期间便可以得到环境隔离的便利, 具体隔离的内容是由使用者决定的, 例如使用 git 来举例的话你甚至可以在一个提交中使用 `commit` 作为 app 的标识通过脚本等工具注册到 `gatex` 中.

通过首次访问 `gatex` 流量转发服务器, 或者清空 `cookie`, 或者通过在 url 中添加 `?gatex=true` 的形式, 你可以在选择 app 页面中启用你需要的环境.

# API DOC

[查看](https://www.apifox.cn/apidoc/shared-40615a01-d7e8-4761-bc74-215ad9f0ee7f)

# 压力测试说明

压力测试需要单独部署进行测试, 不然受到转发服务器的性能限制.

# TODO

- 服务注册时记录时间, 渲染使用时间降序排列
- 支持配置不同项目的回退 API 标识, 最终使用 config.json 中的配置
- 支持 SSR APP
- 更改 `app` `api` 换成数字 ID, 包括 `spa` `ssr` `api` 三种类型
- 插件化的标识管理器
  - 移动到 monorepo 中
  - 提供 GUI 配置页面
- 保留分支与分支匹配模式支持配置文件配置
- 基于分支的工作流放入 docs 目录

## API 服务仓库

### 查看 (TODO)

### 添加 (TODO)

### 删除 (TODO)

## 应用仓库

### 查看 (TODO)

### 添加 (TODO)

### 删除 (TODO)

## 重启 gatex (TODO)
