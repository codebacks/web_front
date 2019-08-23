/**
 *  验证是否为金额
 * @param {*} str 
 * @param { Number } len 验证小数前几位
 * @param { Number } digit 位数
 */
export function isMoney(str, len = 7,digit = 2) {
    if (typeof str !== 'undefined') {
        return (new RegExp(`^(([1-9]\\d{0,${len-1}})|0)(\\.\\d{1,${digit}})?$`)).test(str + '')
    }
}
/**
 * 是否为整数
 * @param {*} str 
 * @param { Number } len 
 * @param { Boolean } isPositive 是否 > 0
 */
export function isInteger(str, len = 7,isPositive = true) {
    if (typeof str !== 'undefined') {
        return (new RegExp(`^(([1-9]\\d{0,${len-1}})${ isPositive ?'|0' : '' })$`)).test(str + '')
    }
}
/**
 * 是否为手机号
 * @param {String} str 
 */
export function isMobile(str) {
    if (str) {
        return /^1[34578]\d{9}$/.test(str + '')
    }
}
