/**
 * 自动部署文件监听
 * 部署服务器需要运行 reciever.js 监听文件上传
 * 启动前 npm install 一下
 */
const https = require('https');
const http = require('http');
const chokidar = require('chokidar');
const os = require('os');
const querystring = require('querystring');
const fs = require("fs");
const logPrefix = "\033[32m[Watcher Deploy]\033[0m";
const _request = (options, callback) => {
    var headers = options.headers ? options.headers : {};
    headers['Content-Type'] = headers['Content-Type'] ? headers['Content-Type'] : 'application/x-www-form-urlencoded';
    // headrs['Content-Length'] = Buffer.byteLength(query);
    headers['x-request-id'] = headers['x-request-id'] ? headers['x-request-id'] : os.hostname() + Date.now()
    let post_data = '';
    if (options.data) {
      options.method = 'POST';
      if (headers['Content-Type'] == 'application/json;charset=utf-8') {
        post_data = JSON.stringify(options.data);
      } else {
        post_data = querystring.stringify(options.data);
      }
      headers['Content-Length'] = Buffer.byteLength(post_data)
    }
    options = {
      protocol: options.protocol,
      host: options.host,
      port: options.port,
      path: options.path,
      method: options.method ? options.method : 'GET',
      headers: headers,
      data: options.data ? options.data : null,
    };
    const _htt = options.protocol == 'https:' ? https : http;  
    const request = _htt.request(options, (res) => {
      res.setEncoding('utf8');
      var resData = '';
      res.on('data', (chunk) => {
        resData += chunk;
      });
      res.on('end', () => {
        callback && callback(resData);
          // console.log(resData);
      });
    });
    if (options.data) {
      request.write(post_data);
    }
    request.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      callback && callback(false);
    });
    request.end();
    return true;
};
const request = (path,content, signal ='')=>{
  _request({
      protocol: 'http:',
      host: 'ifaceparty.com',
      port: 6666,
      method: 'POST',
      path: '/',
      data: {
          path: path,
          content: content,
          signal: signal,
      }
  }, (res) => {
      console.log(logPrefix,"deploy", path, res);
  })
}
const watcher = chokidar.watch(".",{
    ignored: /^(vendor|node_modules|\.git|ffmpeg|vagrant|runtime|\.idea|assets|commands|controller|web|views|widgets)\/*/,
})
watcher
  .on('change', path =>  {
    let content = fs.readFileSync(path, { encoding: 'utf8'});
    request(path,content, 'change');
  })

console.log(logPrefix,"watcher start");
request("__wacher start"," from " + os.hostname(), 'connect');