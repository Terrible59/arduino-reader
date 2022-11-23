const ws = require('ws');
const fs = require('fs');
const path = require('path');
const http = require('http');
const getPorts = require("./serial");

const httpServer = http.createServer();
const wsServer = new ws.Server({port: '3100'});

httpServer.on('request', (req, res) => {
    if (req.url.includes('css')) {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(fs.readFileSync(path.join(__dirname, '..', 'resources', req.url.substring(1))));
    } else if (req.url.includes('js')) {
        res.writeHead(200, { 'Content-Type': 'text/js' });
        res.end(fs.readFileSync(path.join(__dirname, '..', 'resources', req.url.substring(1))));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(path.join(__dirname, '..', 'resources', 'index.html')));
    }
});

httpServer.listen(8181);

getPorts().then(list => {
    switch (list.length) {
        case 0:
            console.log("No ports")
            break
        case 1:
            console.log("Detect 1 port. Connect")
            list[0].connect(9600)
                .pipe(d => d.split(" ").map(Number))
                .on_data(data => {
                    wsServer.on('connection', con => {
                        console.log('Соединение установлено');
                        con.send(JSON.stringify(data));
                    });
                })
            break

        default:
            console.log(`Detect ${list.length} ports:`)
            list.map(console.log)
    }
})