自动监听文件变化并部署到服务端
=======

## 启动服务端

```shell
npm start
```

或 

```shell
npm run r
```

## 启动客户端

0. 安装依赖，目前只有一个`chokidar`，用来监测文件变化

```shell
npm install
```

1. 修改 `config` 中的内容为自己的配置，PS: 可以使用`.config.js` 来覆盖 `config.js` 的配置

2. 启动观察者客户端，初始化同步全量
```shell
npm run a
```

如果不需要同步全量文件，可以启动不同步全量模式

```shell
npm run a
```

## License

MIT