import numeral from 'numeral'
import moment from 'moment'

/**
 * 格式化数字显示文本, 千位分隔符
 * @param {number} amount 金额数字
 * @param {string} [format] 格式，默认'0'
 * @returns 显示文本
 */
export function number(num) {
    return numeral(num).format('0,0')
}

/**
 * 格式化金额显示文本（单位为元）, 千位分隔符，小数点两位
 * @param {number} amount 金额数字
 * @param {string} [format] 格式，默认'0,0.00'
 * @param {string} [currentAmountUnit=Yuan] 当前金额的单位，可选的值Yuan, Jiao, Fen
 * @returns 显示文本
 */
export function jine(amount, format, currentAmountUnit) {
    let numerator = 1
    switch (currentAmountUnit) {
        case "Jiao":
            numerator = 10
            break
        case "Fen":
            numerator = 100
            break
        default:
            numerator = 1
    }

    format = format || '0,0.00'
    return numeral(amount / numerator).format(format)
}

/**
 * 格式化金额显示文本（单位为元）, 千位分隔符，小数点两位
 * @param {number} amount 金额数字
 * @param {string} [format] 格式，默认'0,0.00'
 * @param {string} [currentAmountUnit=Yuan] 当前金额的单位，可选的值Yuan, Jiao, Fen
 * @returns 显示文本
 */
let amount = jine

amount.unit = {
    Jiao: 'Jiao',
    Fen: 'Fen',
    Yuan: 'Yuan'
}

amount.format = {
    default: '0,0.00'
}

export { amount }


/**
 * 格式化时间显示文本, 显示日期和时分
 * @param {string} datetime 金额数字
 * @param {string} [format] 格式，默认'YYYY-MM-DD HH:mm'
 * @returns 显示文本
 */
export function datetime(datetime, format) {
    format = format || 'YYYY-MM-DD HH:mm'
    return datetime && moment(datetime).format(format)
}

/**
 * 数字操作
 * @param {*} num 
 * @param {String} type *  / ...
 * @param {Number} t 
 */
export function toNumber(num, type = '*', t = 100) {
    if(!isNaN(num) && Number(num) !== 0){
        switch (type) {
            case '/':
                return parseFloat((parseFloat(num) / t).toFixed(6))
            case '*':
                return parseFloat((parseFloat(num) * t).toFixed(6))
            default:
                return num
        }
    }else{
        return num
    }
    
}