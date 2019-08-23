/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/1
 */

const requested = {}
exports.setRequest = function setRequest(url, opts = {}) {
    const {onChange} = opts
    if(!requested[url]) {
        requested[url] = 1
        if(url === '/index.html') requested['/'] = 1
        if(onChange) {
            onChange()
        }
    }
}

exports.getRequest = function getRequest() {
    return requested
}
