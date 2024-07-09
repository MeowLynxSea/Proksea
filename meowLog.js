// 保存原始的console方法
const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;

// 创建日期格式化对象
const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // 使用24小时制
});

// 格式化时间函数
function getFormattedTime() {
    return `[${dateFormatter.format(new Date())}]`
}

// 重写console.log方法
console.log = function(...args) {
    originalLog(`${getFormattedTime()}`, ...args)
}

// 重写console.info方法
console.info = function(...args) {
    originalInfo(`${getFormattedTime()}`, ...args)
}

// 重写console.warn方法
console.warn = function(...args) {
    originalWarn(`${getFormattedTime()}`, ...args)
}

// 重写console.error方法
console.error = function(...args) {
    originalError(`${getFormattedTime()}`, ...args)
}