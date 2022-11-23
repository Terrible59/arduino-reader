const { SerialPort, ReadlineParser} = require('serialport')

class Port {
    constructor(portInfo) {
        this.portInfo = portInfo
        this.name = portInfo.pnpId
        this.port = null
        this.parser = null
        this.pipe_functions = []
    }

    connect(baudRate) {
        this.port = new SerialPort({path: this.portInfo.path, baudRate})
        this.parser = this.port.pipe(new ReadlineParser())

        return this
    }

    pipe(callback) {
        this.pipe_functions.push(callback)
        return this
    }

    on_data(callback) {
        this.parser.on("data", data => {
            for (const f of this.pipe_functions) {
                data = f(data)
            }
            callback(data)
        })
    }
}

async function get_ports() {
    const list_raw = await SerialPort.list()
    return list_raw.filter(port => port.pnpId).map(port => new Port(port))
}

module.exports = get_ports