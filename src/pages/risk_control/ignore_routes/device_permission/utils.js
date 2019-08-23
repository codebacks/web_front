/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/4/16
 */

const OptionsMap = {
    is_delete: {
        '0': '正常',
        '1': '已删除',
    },
    is_online: {
        '0': '离线',
        '1': '在线',
    },
    is_active: {
        '0': '未激活',
        '1': '激活',
    }
}

export function getOptionsMap(name) {
    return OptionsMap[name] || {}
}
