const blessed = require('blessed');
const { Writable } = require('stream');
const chalk = require('chalk');

// 创建屏幕对象
const screen = blessed.screen({
    smartCSR: true
});

screen.title = 'Blessed UI';

// 创建日志框
const logBox = blessed.log({
    top: 0,
    left: 0,
    width: '70%',
    height: '100%',
    label: 'Logs',
    border: { type: 'line' },
    style: {
        border: { fg: 'cyan' },
        scrollbar: { bg: 'blue' },
    },
    scrollbar: {
        ch: ' ',
        track: { bg: 'yellow' },
        style: { inverse: true },
    },
    keys: true,
    mouse: true,
    alwaysScroll: true,
    scrollable: true,
    vi: true
});

// 创建状态框
const statusBox = blessed.box({
    top: 0,
    left: '70%',
    width: '30%',
    height: '100%',
    label: 'Status', // 更新标签为 "Status"
    border: { type: 'line' },
    style: {
        border: { fg: 'cyan' }
    },
    content: 'Uptime: 0m 0s' // 初始显示 "Uptime" 统计信息
});

// 创建菜单
const menu = blessed.list({
    top: 'center',
    left: 'center',
    width: '30%',
    height: '30%',
    label: 'Menu',
    border: { type: 'line' },
    style: {
        border: { fg: 'cyan' },
        selected: { bg: 'blue' }
    },
    keys: true,
    mouse: true,
    items: ['Button1', 'Button2', 'Button3'],
    hidden: true,
    vi: true
});

// 添加到屏幕
screen.append(logBox);
screen.append(statusBox);
screen.append(menu);

// 绑定ESC键以打开菜单
screen.key(['escape'], (ch, key) => {
    if (menu.hidden) {
        menu.show();
        screen.render();
        menu.focus();
    } else {
        menu.hide();
        screen.render();
        logBox.focus();
    }
});

// 创建自定义的可写流
class LogStream extends Writable {
    constructor(options) {
        super(options);
    }

    _write(chunk, encoding, callback) {
        logBox.log(chunk.toString());
        callback();
    }
}

// 实例化自定义流
const logStream = new LogStream();

// 重新定向 console 的输出到日志框
console.log = function(...args) {
    logStream.write(chalk.gray(args.join(' ')) + '\n');
};

console.info = function(...args) {
    logStream.write(chalk.white(args.join(' ')) + '\n');
};

console.warn = function(...args) {
    logStream.write(chalk.yellow(args.join(' ')) + '\n');
};

console.error = function(...args) {
    logStream.write(chalk.red(args.join(' ')) + '\n');
};

// 更新 Uptime 统计信息
let uptimeInterval = setInterval(updateUptime, 1000); // 每秒更新一次

function updateUptime() {
    const uptimeSeconds = Math.floor(process.uptime());
    const minutes = Math.floor(uptimeSeconds / 60);
    const seconds = uptimeSeconds % 60;
    statusBox.setContent(`Uptime: ${minutes}m ${seconds}s`);
    screen.render();
}

// 默认使日志框获得焦点
logBox.focus();

// 渲染屏幕
screen.render();

// 示例日志
console.log('Log message');
console.info('Info message');
console.warn('Warning message');
console.error('Error message');



//config.json
const fs = require('fs');
const path = require('path');
require('./meowLog')

console.info("Loading config...")

function loadConfig() {
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

let config = loadConfig();

if (!("serverList" in config)) {
    console.error("proxyOptions is needed.");
    process.exit(1);
}
if (!("proxyServerOptions" in config)) {
    console.error("proxyOptions is needed.");
    process.exit(1);
}
if (!("proxyOptions" in config)) {
    console.error("proxyOptions is needed.");
    process.exit(1);
}
if (!("localServerOptions" in config)) {
    console.error("proxyOptions is needed.");
    process.exit(1);
}

//启动本地服务器作为default和fallback
let defaultServer = require('./localServer')(config)

//启动代理服务器
let proxy = require('./proxy')(config)