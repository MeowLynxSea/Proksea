module.exports = function(config) {
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
            viewDistance: 10,
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

    return defaultServer
}