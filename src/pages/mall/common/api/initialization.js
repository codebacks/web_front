/*
 * @Author: sunlzhi 
 * @Date: 2018-10-10 14:14:11 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-10-19 10:18:05
 */

import config from 'mall/config'

const api = {
    // 获取授权步骤
    procedure: {
        url: `${config.yqxHost_init}/api/procedure`,
        type: 'GET',
    },
    // 获取token信息
    getToken: {
        url: `${config.yqxHost_init}/api/upload`,
        type: 'GET',
    },
    // 新增支付配置
    create: {
        url: `${config.yqxHost_init}/api/wx_merchants`,
        type: 'POST',
    },
    // 获取微信支付列表
    getWxMerchants: {
        url: `${config.yqxHost_init}/api/wx_merchants`,
        type: 'GET',
    },
    // 获取小程序列表
    mpas: {
        url: `${config.yqxHost_init}/api/wx_mpas`,
        type: 'GET',
    },
    // 修改店铺信息
    addShop: {
        url: `${config.yqxHost_init}/api/procedure/add_shop`,
        type: 'POST',
    },
    // 修改店铺信息
    updateShop: {
        url: `${config.yqxHost_init}/api/procedure/update_shop`,
        type: 'POST',
    },
}

export default api
