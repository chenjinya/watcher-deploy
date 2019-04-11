/**
 * 自动部署文件部署
 */
const http = require("http");
const querystring = require("querystring");
const fs = require("fs");

const logPrefix = '\033[32m[Watcher Deploy]\033[0m';
http.createServer(function(req, res){
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
                    try {
                        fs.statSync(dir);
                    } catch (e) {
                        fs.mkdirSync(dir, {
                            recursive: true,
                        })
                    }
                }
                try {
                    fs.writeFile(block.path, block.content);
                    console.log(logPrefix, block.type === 'file.add' ? ` [${+body.deploy_times + (+it+1)} / ${body.files_total}]` : '', `${log} ✅`);
                } catch(e) {
                    console.warn(logPrefix,`${log} ❌`, e);
                }
            }
        }
        res.end('ok');

    });

}).listen(6012);

console.log(logPrefix, "receiver  is start 🎉🎉🎉, port: 6012");

