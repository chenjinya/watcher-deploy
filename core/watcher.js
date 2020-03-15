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
const _ = process.argv.splice(2);
let conf = require("../.config")
conf = conf ? conf : require("../config")

let filesMap = {};
let sendingTimeout = null;
let deployTimes = 0;
let filesTotal = 0;
let deployPerformance = Date.now();
const _request = (options, callback) => {
    var headers = options.headers ? options.headers : {};
    headers['Content-Type'] = headers['Content-Type'] ? headers['Content-Type'] : 'application/x-www-form-urlencoded';
    // headrs['Content-Length'] = Buffer.byteLength(query);
    headers['x-request-id'] = headers['x-request-id'] ? headers['x-request-id'] : os.hostname() + Date.now()
    let post_data = '';
    if (options.data) {
        options.method = 'POST';
        if (headers['Content-Type'].indexOf('application/json') !== -1) {
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
        console.error(logPrefix, `problem with request: ${e.message}`);
        callback && callback(false);
    });
    request.end();
    return true;
};
const request = (communication) => {
    _request({
        protocol: 'http:',
        host: conf.host,
        port: conf.port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        path: conf.target_path,
        data: communication
    }, (res) => {
        if(res !== 'ok') {
            console.warn(logPrefix, res);
        }
    })
}
let bounceRequestCache = [];
const bounceRequest = (data = null) => {
    if(data) {
        let relativePath = data.path.replace(conf.watch_path, '')
        bounceRequestCache.push({
            type: data.type,
            path: relativePath,
            content: fs.readFileSync(data.path).toString('base64') ,
        });
    }
    if(bounceRequestCache.length > 0) {
        if(sendingTimeout) clearTimeout(sendingTimeout);
        sendingTimeout = setTimeout(()=>{

            let _cache = bounceRequestCache.splice(0, 10);

            request({
                data: _cache,
                files_total: filesTotal,
                deploy_times: deployTimes
            });
            deployTimes += _cache.length;
            if(bounceRequestCache.length > 0) {
                bounceRequest();
            }
            if(_cache.length > 0 && _cache[0].type === "file.add") {
                console.log(logPrefix, `[${deployTimes} / ${filesTotal}]`+' file deployed , cost: ' + (Date.now() - deployPerformance) + 'ms');
            }
        }, 100);
    }


}
const watcher = chokidar.watch(conf.watch_path, {
    ignored: /(watcher-deploy|node_modules|\.git|\.idea|\.settings)\/*/,
});

watcher
    .on('change', path => {
        if(!filesMap[path]) filesMap[path] = 0;
        filesMap[path] ++;
        bounceRequest({
            path,type: 'file.change'
        })
        let relativePath = path.replace(conf.watch_path, '')
        console.log(logPrefix, `📊 File ${relativePath}, deploy times  ${filesMap[path]}`)
    })
    .on('add', path => {
        if (-1 === _.indexOf("--half")) {
            filesMap[path] = 0;
            filesTotal ++;
            bounceRequest({
                path,type: 'file.add'
            })
        }
    })

console.log(logPrefix, "watcher start 🎉🎉🎉");
request({
    data: {
        signal: 'watcher.start',
        content: os.hostname()
    }
});