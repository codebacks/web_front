/*
 * @Author: sunlzhi 
 * @Date: 2018-08-16 11:53:29 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-08-28 17:52:36
 */

import config from 'setting/config'

const api = {
    subscription: {
        url: `${config.apiHost_wu}/api/wx_mps`,
        type: 'GET',
    },
    addSubConfigure: {
        url: `${config.apiHost_wu}/api/wx_mps/{app_id}`,
        type: 'GET',
    },
    payConfigure: {
        url: `${config.apiHost_wu}/api/wx_merchants`,
        type: 'GET',
    },
    // 获取七牛token
    qiniuToken: {
        url: `${config.apiHost_wu}/api/upload`,
        type: 'GET',
    },
    // 修改公众号内的信息
    putSubConfigure: {
        url: `${config.apiHost_wu}/api/wx_mps/{app_id}`,
        type: 'PUT',
    },
    // 获取公众号授权信息
    getSubAuthInfo: {
        url: `${config.apiHost_wu}/api/wx_mps/{app_id}/permissions`,
        type: 'GET'
    },
    // 解除公众号授权
    subUnbind: {
        url: `${config.apiHost_wu}/api/wx_mps/{app_id}`,
        type: 'DELETE'
    },

    // 公众号授权完成回调
    subAuth: {
        url: `${config.apiHost_wu}/api/wx_mps/{app_id}/auth`,
        type: 'POST'
    },
}

export default api