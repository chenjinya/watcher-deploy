/**
 * 自动部署文件部署
 */
const http = require("http");
const querystring = require("querystring");
const fs = require("fs");

const logPrefix = '[Dianxin Dev Deploy]';
http.createServer(function(req, res){
    res.writeHead(200, { 'Content-Type': 'text-plain' });
    let body = "";
    req.on('data', function (chunk) {
        body += chunk; 
    });
    req.on('end', function () {
        body = querystring.parse(body);
        // console.log("body:",body);
        if(/^(__)/.test(body.path)) {
            console.log(logPrefix, "signal", body.path, body.content, body.signal);
            res.end('signal ok\n');
        } else {
            console.log(logPrefix, "deploy", body.path, body.signal);
            fs.writeFile(body.path, body.content);
            res.end('deploy ok\n');
        }
    });

}).listen(6012);

console.log(logPrefix, "reciever is start, port: 6012");

