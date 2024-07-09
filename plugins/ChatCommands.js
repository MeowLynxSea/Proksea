const helpText = "\
==== Proksea 指令 ====\n\n\
/proksea help - 获取此帮助\n\
/proksea connect <server> - 连接到指定服务器\n\n\
======================\n"

function handleCommands(client, proxy, localServerOptions, proxyOptions) {
    client.on('chat', (data, metadata) => {
        let split = data.message.split(' ')
        if (split[0] === '/proksea') {
            if (split[1]) {
                switch (split[1]) {
                    case 'help':
                        client.write('chat', { message: JSON.stringify({ text: helpText }), position: 0, sender: "Proksea" })
                        break
                    case 'connect':
                        if (split[2]) {
                            if (split[2] in proxy.serverList) {
                                client.write('chat', { message: JSON.stringify({ text: "连接中，请稍候...\n" }), position: 0, sender: "Proksea" })
                                proxy.setRemoteServer(client.id, split[2])
                            } else {
                                client.write('chat', { message: JSON.stringify({ text: "连接失败: 指定的服务器不存在\n" }), position: 0, sender: "Proksea" })
                            }
                        } else {
                            client.write('chat', { message: JSON.stringify({ text: "指令用法：/proksea connect <server>\n发送 /proksea help 以获取更多帮助\n" }), position: 0, sender: "Proksea" })
                        }
                        break
                    default:
                        client.write('chat', { message: JSON.stringify({ text: "未知的指令: /proksea " + split[1] + "\n发送 /proksea help 以获取更多帮助\n" }), position: 0, sender: "Proksea" })
                }
            } else {
                client.write('chat', {
                    message: JSON.stringify({ text: helpText }),
                    position: 0,
                    sender: "Proksea"
                })
            }
        }
    })
}

module.exports = handleCommands