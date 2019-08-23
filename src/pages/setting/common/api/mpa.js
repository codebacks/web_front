/*
 * @Author: sunlzhi 
 * @Date: 2018-08-24 18:00:04 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-08-25 14:30:30
 */

import config from 'setting/config'

const api = {
    mpas: {
        url: `${config.apiHost_wu}/api/wx_mpas`,
        type: 'GET',
    },
    // 支付配置
    payConfigure: {
        url: `${config.apiHost_wu}/api/wx_merchants`,
        type: 'GET',
    },
    // 修改小程序内的信息
    putSubConfigure: {
        url: `${config.apiHost_wu}/api/wx_mpas/{app_id}`,
        type: 'PUT',
    },
    // 获取小程序授权信息
    getSubAuthInfo: {
        url: `${config.apiHost_wu}/api/wx_mpas/{app_id}/permissions`,
        type: 'GET'
    },
    // 解除小程序授权
    mpaUnbind: {
        url: `${config.apiHost_wu}/api/wx_mpas/{app_id}`,
        type: 'DELETE'
    },

    // 小程序授权完成后接口
    mpaAuth: {
        url: `${config.apiHost_wu}/api/wx_mpas/{app_id}/auth`,
        type: 'POST'
    },
}

export default api
