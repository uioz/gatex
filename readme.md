# 前端没有对应的服务端环境, 转发到默认的服务

# API 网关没有对应的环境, 则通过配置页面来配置对应的应用

# /etc/init/env.conf

env NODE_ENV=production

# 环境命名规则

## API 服务

使用小写英文字符即可, 包括那些不会与 URL 和文件系统产生冲突的字符, 但是不包括 `@`.

## 应用服务

分为两种情况, 一种是与 API 服务同名, 在这种情况下, 一个应用服务对应一个 API 服务.

第二种情况使用 `@` 分割的字符串, `@` 之前的指代 API 服务, `@` 之后的指代应用.

# API DOC

## API 服务仓库

### 查看 (TODO)

### 添加 (TODO)

### 删除 (TODO)

## 应用仓库

### 查看 (TODO)

### 添加 (TODO)

### 删除 (TODO)

## 重启 gatex (TODO)

## 获取服务列表

```
GET /api/service
```

response:

```
[
  {
    label:'xxx',
    url:'xxxx',
    type:'api'
  },
  {
    label:'xxx',
    type:'app'
  }
]
```

## 添加 API 服务

```
POST /api/service/api/<prefix>?[url]

// prefix 环境名称 (分支后缀)
// url 服务地址, 可以不填写则使用来源IP, 如果不指定端口则通过 prefix 计算端口
```

## 添加 APP 服务

```
POST /api/service/app/<target>

// target 应用名称

BODY binary // zip 文件, 解压后至少包含一个 `index.html` 文件
```

## 克隆 APP 服务

```
POST /api/service/app/clone/<source>/<target>

// source 克隆源, 必须是已有 APP 名称
// target 克隆目标
```

## 删除 API 服务

```
DELETE /api/service/api/<target>

// target api服务名称
```

## 删除 APP 服务

```
DELETE /api/service/app/<target>?[all]

// target 应用名称
// all boolean 表示是否删除对应前缀的所有的应用, 例如 `/api/service/app/dev?all=true` 删除 `dev@frontend` `dev@admin` 等.
```

# 压力测试说明

压力测试需要单独部署进行测试, 不然受到转发服务器的性能限制.

# TODO

- 保留分支与分支匹配模式支持配置文件配置

# 启动指令(旧)

```
node ./dist/server.mjs gitlab服务器地址@项目ip@项目token
```