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
let defaultServer = require('./localServer')(config)

//启动代理服务器
let proxy = require('./proxy')(config)

//控制台指令处理
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function handleCommand(command) {
    const args = command.trim().split(' ');
    const cmd = args[0].toLowerCase();

    switch (cmd) {
        case 'greet':
            const name = args[1] || 'stranger';
            console.log(`Hello, ${name}!`);
            break;
        case 'exit':
            console.log('Goodbye!');
            rl.close();
            break;
        default:
            console.log(`Unknown command: ${cmd}`);
    }
}

rl.setPrompt('> ');
rl.prompt();

rl.on('line', (input) => {
    handleCommand(input);
    rl.prompt();
});
rl.on('close', () => {
    console.log('Stopping server...')
    Object.values(proxy.clients).forEach(client => {
        client.write('kick_disconnect', {
            reason: '111'
        })
    })
    process.exit(0);
});