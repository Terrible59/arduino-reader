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

httpServer.listen(8181)
console.log("http://localhost:8181/")

const connects = []
const ports = []

setInterval(async () => {
    const available_ports = await getPorts()
    const connected_ports_names = ports.map((p) => p.name)
    const new_ports = available_ports.filter(p => !connected_ports_names.includes(p.name))

    for (const newPort of new_ports) {
        console.log(`Connect ${newPort.name}`)
        newPort.connect(9600)
            .pipe(d => d.trim()
                .split(" ")
                .map(Number))
            .on_data(data => {
                for (const con of connects) {
                    con.send(JSON.stringify({id_port: newPort.name, data}));
                }
            })
            .on_close(() => {
                console.log(`Close ${newPort.name}`)
                ports.splice(ports.findIndex(p => p.name === newPort.name), 1)
            })
        ports.push(newPort)
    }

}, 1000)

wsServer.on('connection', con => {
    connects.push(con);
});
