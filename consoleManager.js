const readline = require('readline');
const EventEmitter = require('events');

class ConsoleManager extends EventEmitter {
    constructor() {
        super();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.rl.setPrompt('> ');
        this.currentInput = '';
        this.lastLineOffset = 0; // 记录最后一行的偏移量

        // 创建日期格式化器
        this.dateFormatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // 使用24小时制
        });

        this._overrideConsole();
        this._setupReadline();
        this.rl.prompt();
    }

    getFormattedTime() {
        return `[${this.dateFormatter.format(new Date())}]`;
    }

    _overrideConsole() {
        const originalLog = console.log;
        const originalInfo = console.info;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (message) => {
            this._moveCursorToLastLine();
            originalLog(`${this.getFormattedTime()} ${message}`);
            this.rl.prompt();
        };

        console.info = (message) => {
            this._moveCursorToLastLine();
            originalInfo(`${this.getFormattedTime()} ${message}`);
            this.rl.prompt();
        };

        console.error = (message) => {
            this._moveCursorToLastLine();
            originalError(`${this.getFormattedTime()} ${message}`);
            this.rl.prompt();
        };

        console.warn = (message) => {
            this._moveCursorToLastLine();
            originalWarn(`${this.getFormattedTime()} ${message}`);
            this.rl.prompt();
        };
    }

    _setupReadline() {
        this.rl.on('line', (input) => {
            this.currentInput = ''; // 清空当前输入
            this.emit('line', input); // 触发 line 事件
            this.rl.prompt();
        });

        // 捕捉输入事件，并手动处理字符显示
        this.rl.input.on('keypress', (char, key) => {
            if (key.name === 'return' || key.name === 'enter') {
                // 当按下回车键时，清空 currentInput，并发出 'line' 事件
                this.currentInput = '';
            } else if (key.name === 'backspace') {
                // 处理退格键
                if (this.currentInput.length > 0) {
                    this.currentInput = this.currentInput.slice(0, -1); // 删除一个字符
                    this._moveCursorToLastLine();
                }
            } else if (!key.ctrl && !key.meta && char) {
                // 处理普通字符，不拦截功能键和控制键
                this.currentInput += char; // 添加字符到当前输入
                this._moveCursorToLastLine();
            }
        });
    }

    _moveCursorToLastLine() {
        readline.moveCursor(process.stdout, 0, -this.lastLineOffset); // 将光标移动到最后一行的位置
        readline.cursorTo(process.stdout, 0); // 将光标移动到行首
        readline.clearLine(process.stdout, 1); // 清除当前行，包括提示符
        readline.moveCursor(process.stdout, 0, this.lastLineOffset); // 恢复光标位置
        readline.cursorTo(process.stdout, 0); // 将光标移动到行首
        process.stdout.write(`> ${this.currentInput}`); // 重新显示提示符和当前输入内容
        readline.moveCursor(process.stdout, 0, -this.lastLineOffset); // 将光标移动到最后一行的位置
    }
}

module.exports = ConsoleManager;