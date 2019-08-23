/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/4
 */

export function firstStringToUppercase(str) {
    return str.replace(/^(\w){1}(.*)/, ($0, $1, $2) => {
        return $1.toUpperCase() + $2
    })
}
