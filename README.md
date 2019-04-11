自动监听文件变化并部署到服务端
=======

## 启动服务端

```shell
npm start
```


## 启动客户端

1. 安装依赖，目前只有一个`chokidar`，用来监测文件变化

```shell
npm install
```

2. 启动观察者客户端，初始化同步全量
```shell
npm run watch
```

如果不需要同步全量文件，可以启动不同步全量模式

```shell
npm run hot-watch
```


## 注意

需要运行在工程文件目录下，如果是其他目录，不保证路径能够正确


MIT