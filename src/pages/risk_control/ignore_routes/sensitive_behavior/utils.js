/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/4/16
 */

const OptionsMap = {
    handle_status: {
        '0': '未处理',
        '1': '已处理',
    },
    target_type: {
        '0': '好友',
        '1': '群',
    },
    status: {
        '0': '异常',
        '1': '正常',
    }
}

export function getOptionsMap(name) {
    return OptionsMap[name] || {}
}
