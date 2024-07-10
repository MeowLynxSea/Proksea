const fs = require('fs');
const path = require('path');

module.exports = function(config) {
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

    return proxy
}