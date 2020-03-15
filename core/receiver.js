/**
 * 自动部署文件部署
 */
const http = require("http");
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
let conf = require("../.config");
conf = conf ? conf : require("../config");

const logPrefix = '\033[32m[Watcher Deploy]\033[0m';

const mkdir = function(dir){
    try {
        fs.statSync(dir);
        return true;
    } catch (e) {
        if (mkdir(path.dirname(dir))) {
            fs.mkdirSync(dir);
            return true;
        }
    }
};

http.createServer(function(req, res){
    if(req.headers['password'] !== conf.pass){
        console.error(logPrefix, `Auth Error: header password is '${req.headers['Password']}', conf.pass is '${conf.pass}' `);
        res.writeHead(401, { 'Content-Type': 'text-plain' });
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text-plain' });
    let rawPostData = "";
    req.on('data', function (chunk) {
        rawPostData += chunk;
    });

    req.on('end', function () {
        let body = JSON.parse(rawPostData)
        let filesData = body.data;
        for(let it in filesData) {
            let block = filesData[it]
            if(block.signal) {
                console.log(logPrefix, "signal", block.signal, block.content);
                res.end(block.signal + ' receive ok\n');
            } else if(block.path) {
                let dir = block.path.substr(0, block.path.lastIndexOf("/"));
                let log = ` deploy ${block.path} `;
                if(dir) {
                    mkdir(dir)
                }
                try {
                    fs.writeFile(conf.target_path + block.path, (new Buffer.alloc(block.content.length, block.content, 'base64')), () => {
                        console.log(logPrefix, block.type === 'file.add' ? ` [${+body.deploy_times + (+it+1)} / ${body.files_total}]` : '', `${log} ✅`);
                    });
                } catch(e) {
                    console.warn(logPrefix,`${log} ❌`, e);
                }
            }
        }
        res.end('ok');

    });

}).listen(conf.port);

console.log(logPrefix, "receiver  is start 🎉🎉🎉, port: ", conf.port);

