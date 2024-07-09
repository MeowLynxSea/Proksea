//config.json
const fs = require('fs');
const path = require('path');
require('./meowLog')

console.info("Loading config...")

function getConfig() {
    const configPath = path.join(__dirname, 'config.json');
    try {
        const rawConfig = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(rawConfig);
        return config;
    } catch (error) {
        console.error('Error reading config file:', error);
        process.exit(1);
    }
}

const config = getConfig();

//启动本地服务器作为default和fallback
const mc = require('minecraft-protocol')

console.info("Starting local server...")
config.serverList.default.port = config.localServerOptions.port
const defaultServer = mc.createServer(config.localServerOptions)

const mcData = require('minecraft-data')("1.16.3")
const loginPacket = mcData.loginPacket

defaultServer.on('playerJoin', (client) => {
    isConnected = true
    client.write('login', {
        ...loginPacket,
        entityId: client.id,
        isHardcore: false,
        gameMode: 0,
        previousGameMode: 1,
        worldName: 'minecraft:overworld',
        hashedSeed: [0, 0],
        maxPlayers: defaultServer.maxPlayers,
        viewDistance: 1,
        reducedDebugInfo: false,
        enableRespawnScreen: true,
        isDebug: false,
        isFlat: false
    })
    client.on('end', () => { isConnected = false })
    client.on('error', () => { isConnected = false })
    client.write('position', {
        x: 0,
        y: 0,
        z: 0,
        yaw: 0,
        pitch: 0,
        flags: 0x00
    })

    client.write('chat', {
        message: JSON.stringify({ text: "欢迎使用Proksea\n发送 /proksea help 以获取更多帮助\n" }),
        position: 0,
        sender: "Proksea"
    })
})

console.info("Local server listening on port " + config.localServerOptions.port)

//启动代理服务器
const McProxy = require('basic-minecraft-proxy')

let proxyServerOptions = config.proxyOptions
let serverList = config.serverList
let proxyOptions = {}
let proxyPlugins = []

//加载插件
const pluginsDir = path.resolve(__dirname, './plugins');
const files = fs.readdirSync(pluginsDir);
files.forEach(file => {
    if (path.extname(file) === '.js') {
        const filePath = path.join(pluginsDir, file);
        console.log("Found plugin: [" + file + "]")
        proxyPlugins.push(require(filePath))
    }
});

let proxy = McProxy.createProxy(proxyServerOptions, serverList, proxyOptions, proxyPlugins);



proxy.on('error', (err) => {
    console.error("A error occured while running proxy: " + err)
})

proxy.on('listening', () => {
    console.info('Proxy listening on port ' + proxyServerOptions.port)
})

proxy.on('login', (player) => {
    console.info(`[${player.username}] connected from ${player.socket.remoteAddress}`)

    player.on('end', () => {
        console.info(`[${player.username}] disconnected: ${player.socket.remoteAddress}`)
    })

    player.on('error', (err) => {
        console.error(`[${player.username}] disconnected with error: ${player.socket.remoteAddress}`, err)
    })
})

proxy.on('moveFailed', (err, playerId, oldServerName, newServerName) => {
    console.error(`Player [${proxy.clients[playerId].username}] failed to move from ${oldServerName} to ${newServerName}`, err)
})

proxy.on('playerMoving', (playerId, oldServerName, newServerName) => {
    console.info(`Player [${proxy.clients[playerId].username}] is moving from ${oldServerName} to ${newServerName}`)
})

proxy.on('playerMoved', (playerId, oldServerName, newServerName) => {
    console.info(`Player [${proxy.clients[playerId].username}] has moved from ${oldServerName} to ${newServerName}`)
})

proxy.on('playerFallback', (playerId, oldServerName, newServerName) => {
    console.info(`Player [${proxy.clients[playerId].username}] is falling back from ${oldServerName} to ${newServerName}`)
})