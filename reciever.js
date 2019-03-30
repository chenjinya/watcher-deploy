/**
 * 自动部署文件部署
 */
const http = require("http");
const querystring = require("querystring");
const fs = require("fs");

const logPrefix = '\033[32m[Watcher Deploy]\033[0m';
http.createServer(function(req, res){
    res.writeHead(200, { 'Content-Type': 'text-plain' });
    let body = "";
    req.on('data', function (chunk) {
        body += chunk; 
    });
    req.on('end', function () {
        body = querystring.parse(body);
        if(/^(__)/.test(body.path)) {
            console.log(logPrefix, "signal", body.path, body.content, body.signal);
            res.end('signal ok\n');
        } else {
            let dir = body.path.substr(0, body.path.lastIndexOf("/"));
            console.log(logPrefix, "deploy", body.path, body.signal);
            if(dir) {
                try {
                    fs.statSync(dir);
                } catch (e) {
                    fs.mkdirSync(dir, {
                        recursive: true,
                    })
                }
            }
            fs.writeFile(body.path, body.content);
            res.end('deploy ok\n');
        }
    });

}).listen(6012);

console.log(logPrefix, "reciever is start, port: 6012");

