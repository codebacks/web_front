/**
 * 文件说明: restful 接口
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */

import config from 'wx/config'

export default function (name) {
    return {
        LIST: {
            url: `${config.apiHost}/${name}`,
            type: 'GET',
        },
        CREATE: {
            url: `${config.apiHost}/${name}`,
            type: 'POST',
        },
        DETAIL: {
            url: `${config.apiHost}/${name}/{id}`,
            type: 'GET',
        },
        UPDATE: {
            url: `${config.apiHost}/${name}/{id}`,
            type: 'PUT',
        },
        DELETE: {
            url: `${config.apiHost}/${name}/{id}`,
            type: 'DELETE',
        },
    }
}
