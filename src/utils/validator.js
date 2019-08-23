import { isMoney, isInteger,isMobile } from "./regex"

/**
 *  验证金额
 * @param {*} rules 
 * @param {*} value 
 * @param {*} callback 
 * @param {*} digit 
 */
export function validatorByIsMoney(rules, value, callback) {
    if (value) {
        if (isMoney(value)) {
            callback()
        } else {
            callback(`请输入纯数字，保留小数2位，最大支持小数点前7位`)
        }
    } else {
        callback()
    }

}

/**
 * 验证金额，>0
 * @param {*} rules 
 * @param {*} value 
 * @param {*} callback 
 */
export function validatorByIsPositiveMoney(rules, value, callback, len = 7, n = 0, digit = 2, key = '金额') {
    if(arguments.length === 5){
        len = 7
        n = 0
        digit = 2
        key='金额'
    }
    if (value) {
        if (isMoney(value, len, digit)) {
            if (n >= 0) {
                if (parseFloat(value) > n) {
                    callback()
                } else {
                    callback(`${key}必须大于${n}`)
                }
            } else {
                callback()
            }
        } else {
            callback(`请输入纯数字，保留小数${digit}位，最大支持小数点前${len}位`)
        }
    } else {
        callback()
    }
}

/**
 * 验证是否为正整数
 * @param {*} rules 
 * @param {*} value 
 * @param {*} callback 
 */
export function validatorByIsInteger(rules, value, callback, len = 7, n = 0,key='此项') {
    if(arguments.length === 5){
        len = 7
        n = 0
        key='此项'
    }
    if (value) {
        if (isInteger(value, len)) {
            if (n >= 0) {
                if (parseFloat(value) > n) {
                    callback()
                } else {
                    callback(`${key}必须大于${n}`)
                }
            } else {
                callback()
            }
        } else {
            callback(`请输入正整数，最大支持${len}位`)
        }
    } else {
        callback()
    }
}

/**
 * 验证是否为正整数
 * @param {*} rules 
 * @param {*} value 
 * @param {*} callback 
 */
export function validatorByIsNumber(rules, value, callback) {
    if (value) {
        if (isMoney(value, 7, 3)) {
            if (parseFloat(value) > 0) {
                callback()
            } else {
                callback('此项必须大于0')
            }
        } else {
            callback(`此项最大支持小数点前7位，可保留3位小数`)
        }
    } else {
        callback()
    }
}


export function validatorByNumber() {
    let args = [...arguments]
    let ruleArg = args.slice(-5),
        rules = ruleArg[0],
        value = ruleArg[1],
        callback = ruleArg[2]
    let params = {
        len: 7,
        digit: 2,
        '>': null
    }
    if (args[0].type === 'number') {
        params = {
            // 小数点前几位
            len: args[0].len,
            //保留几位小数，0 或不传为整数
            digit: args[0].d,
            // 是否大于0，传数值则 > 此值
            '>': typeof args[0]['>'] !== 'undefined' ? args[0]['>'] : null,
        }
    }
    //TODO
    if (value) {
        if (params.digit) {
            validatorByIsPositiveMoney(rules, value, callback, params.len, params['>'] , params.digit, params.key = '金额')
        } else {
            validatorByIsInteger(rules, value, callback, params.len, params['>'])
        }
    } else {
        callback()
    }

}
/**
 * 验证手机号
 * @param {*} rules 
 * @param {*} value 
 * @param {*} callback 
 */
export function validatorByIsMobile(rules, value, callback) {
    if (value) {
        if (isMobile(value)) {
            callback()
        }else{
            callback("请输入正确的手机号码") 
        }
    } else {
        callback()
    }
}
