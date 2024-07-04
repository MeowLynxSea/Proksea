const mc = require('minecraft-protocol')

const states = mc.states

function printHelpAndExit(exitCode) {
    console.log('usage: node proxy.js [<options>...] <serverPort> <verison>')
    console.log('options:')
    console.log('  --dump name')
    console.log('    print to stdout messages with the specified name.')
    console.log('  --dump-all')
    console.log('    print to stdout all messages, except those specified with -x.')
    console.log('  -x name')
    console.log('    do not print messages with this name.')
    console.log('  name')
    console.log('    a packet name as defined in protocol.json')

    process.exit(exitCode)
}

if (process.argv.length < 4) {
    console.log('Too few arguments!')
    printHelpAndExit(1)
}

process.argv.forEach(function(val) {
    if (val === '-h') {
        printHelpAndExit(0)
    }
})

const args = process.argv.slice(2)
let port
let version

let printAllNames = false
const printNameWhitelist = {}
const printNameBlacklist = {};
(function() {
    let i = 0
    for (i = 0; i < args.length; i++) {
        const option = args[i]
        if (!/^-/.test(option)) break
        if (option === '--dump-all') {
            printAllNames = true
            continue
        }
        i++
        const name = args[i]
        if (option === '--dump') {
            printNameWhitelist[name] = 'io'
        } else if (option === '-x') {
            printNameBlacklist[name] = 'io'
        } else {
            printHelpAndExit(1)
        }
    }
    if (!(i + 2 <= args.length && args.length <= i + 4)) printHelpAndExit(1)
    port = args[i++]
    version = args[i++]
})()

const srv = mc.createServer({
    'online-mode': false,
    port,
    keepAlive: false,
    version,
    motd: 'Customized MOTD & Favicon',
    favicon: 'data:image/png;base64,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'
})

let targetServer = new Map();

srv.on('connection', client => {
    client.on('packet', (data, meta) => {
        if (meta.state === states.HANDSHAKING && client.state === states.HANDSHAKING) {
            console.log('[HANDSHAKING] ',
                client.state + '.' + meta.name + ' :' +
                JSON.stringify(data))
            switch (data.serverHost) {
                case 'egg.localhost.demo':
                    targetServer.set(client.socket.remoteAddress, { host: 'cloudegg.cloud', port: 25565 })
                    break
                case 'm.localhost.demo':
                    targetServer.set(client.socket.remoteAddress, { host: 'Mchaptim.cn', port: 25565 })
                    break
                case 'toilet.localhost.demo':
                    targetServer.set(client.socket.remoteAddress, { host: 'toiletmc.net', port: 25565 })
                    break
                default:
                    targetServer.set(client.socket.remoteAddress, { host: 'localhost', port: 25566 })
            }
        }
    })
})

srv.on('login', function(client) {
    const addr = client.socket.remoteAddress
    console.log('Incoming connection', '(' + addr + ')')
    let endedClient = false
    let endedremoteClient = false
    client.on('end', function() {
        endedClient = true
        console.log('Connection closed by client', '(' + addr + ')')
        if (!endedremoteClient) { remoteClient.end('End') }
    })
    client.on('error', function(err) {
        endedClient = true
        console.log('Connection error by client', '(' + addr + ')')
        console.log(err.stack)
        if (!endedremoteClient) { remoteClient.end('Error') }
    })
    const remoteClient = mc.createClient({
        host: targetServer.get(addr).host,
        port: targetServer.get(addr).port,
        username: client.username,
        keepAlive: false,
        version
    })
    client.on('packet', function(data, meta) {
        if (remoteClient.state === states.PLAY && meta.state === states.PLAY) {
            if (shouldDump(meta.name, 'o')) {
                console.log('client->server:',
                    client.state + ' ' + meta.name + ' :',
                    JSON.stringify(data))
            }
            if (!endedremoteClient) { remoteClient.write(meta.name, data) }
        }
    })
    remoteClient.on('packet', function(data, meta) {
        if (meta.state === states.PLAY && client.state === states.PLAY) {
            if (shouldDump(meta.name, 'i')) {
                console.log('client<-server:',
                    remoteClient.state + '.' + meta.name + ' :' +
                    JSON.stringify(data))
            }
            if (!endedClient) {
                client.write(meta.name, data)
                if (meta.name === 'set_compression') {
                    client.compressionThreshold = data.threshold
                } // Set compression
            }
        }
    })
    remoteClient.on('error', err => {
        console.log(err.message)
    })
    const bufferEqual = require('buffer-equal')
    remoteClient.on('raw', function(buffer, meta) {
        if (client.state !== states.PLAY || meta.state !== states.PLAY) { return }
        const packetData = remoteClient.deserializer.parsePacketBuffer(buffer).data.params
        const packetBuff = client.serializer.createPacketBuffer({ name: meta.name, params: packetData })
        if (!bufferEqual(buffer, packetBuff)) {
            console.log('client<-server: Error in packet ' + meta.state + '.' + meta.name)
            console.log('received buffer', buffer.toString('hex'))
            console.log('produced buffer', packetBuff.toString('hex'))
            console.log('received length', buffer.length)
            console.log('produced length', packetBuff.length)
        }
        /* if (client.state === states.PLAY && brokenPackets.indexOf(packetId.value) !=== -1)
         {
         console.log(`client<-server: raw packet);
         console.log(packetData);
         if (!endedClient)
         client.writeRaw(buffer);
         } */
    })
    client.on('raw', function(buffer, meta) {
        if (meta.state !== states.PLAY || remoteClient.state !== states.PLAY) { return }
        const packetData = client.deserializer.parsePacketBuffer(buffer).data.params
        const packetBuff = remoteClient.serializer.createPacketBuffer({ name: meta.name, params: packetData })
        if (!bufferEqual(buffer, packetBuff)) {
            console.log('client->server: Error in packet ' + meta.state + '.' + meta.name)
            console.log('received buffer', buffer.toString('hex'))
            console.log('produced buffer', packetBuff.toString('hex'))
            console.log('received length', buffer.length)
            console.log('produced length', packetBuff.length)
        }
    })
    remoteClient.on('end', function() {
        endedremoteClient = true
        console.log('Connection closed by server', '(' + addr + ')')
        if (!endedClient) { client.end('服务器关闭了连接') }
    })
    remoteClient.on('error', function(err) {
        endedremoteClient = true
        console.log('Connection error by server', '(' + addr + ') ', err)
        console.log(err.stack)
        if (!endedClient) { client.end('连接发生了错误') }
    })
})

function shouldDump(name, direction) {
    if (matches(printNameBlacklist[name])) return false
    if (printAllNames) return true
    return matches(printNameWhitelist[name])

    function matches(result) {
        return result !== undefined && result !== null && result.indexOf(direction) !== -1
    }
}