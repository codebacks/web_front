/**
 **@Description:
 **@author: leo
 */

import config from 'setting/config'

export default {
    getShopList: {
        url: `${config.apiHost_wu}/api/shops`,
        type: 'GET',
    },
    getShopListOauth: {
        url: `${config.apiHost_wu}/api/shops/auth/shops`,
        type: 'GET',
    },
    createShop: {
        url: `${config.apiHost_wu}/api/shops`,
        type: 'POST',
    },
    getToken: {
        url: `${config.apiHost_wu}/api/shops/common/upload`,
        type: 'GET',
    },
    editeShopStore: {
        url: `${config.apiHost_wu}/api/shops`,
        type: 'PUT',
    },
    shopOauthXuan: {
        url: `${config.apiHost_wu}/api/shops/bind_mpa`,
        type: 'POST',
    },
    deleteOauthTao: {
        url: `${config.apiHost_wu}/api/shops`,
        type: 'PUT',
    },
    deleteOauthXuan: {
        url: `${config.apiHost_wu}/api/shops`,
        type: 'PUT',
    },
    oauthXuanList: {
        url: `${config.apiHost_wu}/api/wx_mpas`,
        type: 'GET',
    },
    getOauthUrl: {
        url: `${config.apiHost_wu}/api/shops/auth/login`,
        type: 'POST',
    },
    getOauthInfo: {
        url: `${config.apiHost_wu}/api/shops`,
        type: 'GET',
    },
    editeShopDepart: {
        url: `${config.apiHost_wu}/api/shops`,
        type: 'PUT',
    },
    shopOauthSucc: {
        url: `${config.apiHost_wu}/api/shops/auth`,
        type: 'POST',
    },
    // 过期提醒
    getDueRemind:{
        url: `${config.apiHost_wu}/api/shops/expire_reminder`,
        type: 'GET',
    },
    postDueRemind:{
        url: `${config.apiHost_wu}/api/shops/expire_reminder`,
        type: 'POST',
    },
    putDueRemind:{
        url: `${config.apiHost_wu}/api/shops/expire_reminder`,
        type: 'PUT',
    },
    getJdOauthUrl:{
        url: `${config.apiHost_wu}/public/shops/ext_auth`,
        type: 'GET',
    },
    // 聚水潭授权
    getJstOauthUrl: {
        url: `${config.apiHost_wu}/api/shops/jst_auth`,
        type: 'POST'
    },
}
