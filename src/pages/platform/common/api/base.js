/**
 * 文件说明: restful 接口
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 18/08/01
 */

import config from '../../config'

export default function(name) {
    return {
        list: {
            url: `${config.apiHost}/${name}`,
            type: 'GET',
        },
        create: {
            url: `${config.apiHost}/${name}`,
            type: 'POST',
        },
        detail: {
            url: `${config.apiHost}/${name}/{id}`,
            type: 'GET',
        },
        update: {
            url: `${config.apiHost}/${name}/{id}`,
            type: 'PUT',
        },
        remove: {
            url: `${config.apiHost}/${name}/{id}`,
            type: 'DELETE',
        },
    }
}
