/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/7
 */

import config from 'community/config'

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