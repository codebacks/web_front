'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [wuming]
 * 创建日期 16/10/6
 *
 */
import config from 'crm/config'

export default {
    userPoolList: {
        url: `${config.apiHost_wu}/api/customer/user_pools`,
        type: 'GET',
    },
    importList: {
        url: `${config.apiHost_wu}/api/customer/user_pools/import_histories`,
        type: 'GET',
    },
    importData:{
        url: `${config.apiHost_wu}/api/customer/user_pools/import`,
        type: 'post',
    },
    getUploadToken:{
        url: `${config.apiHost_wu}/api/upload`,
        type: 'get',
    },
     // 店铺列表
     getShopList:{
        url: `${config.apiHost_wu}/api/shops`,
        type: 'get',
    },
    filterUserPool:{
        url: `${config.apiHost_wu}/api/customer/user_pools/filter`,
        type: 'get',
    },
    smsSignatureList:{
        url: `${config.apiHost_wu}/api/sms/signatures`,
        type: 'get',
    },
    errorList: {
        url: `${config.apiHost_wu}/api/customer/user_pools/import_history/{id}/records`,
        type: 'GET',
    },
    editRemark: {
        url: `${config.apiHost_wu}/api/customer/user_pools/{id}`,
        type: 'put',
    },
    exportErrorList: {
        url: `${config.apiHost_wu}/api/customer/user_pools/import_history/{id}/records/export`,
        type: 'get',
    },
    smsCount: {
        url: `${config.apiHost_wu}/api/sms/count`,
        type: 'get',
    },
    smsModelList: {
        url: `${config.apiHost_wu}/api/sms/templates`,
        type: 'get',
    },
    sendSms: {
        url: `${config.apiHost_wu}/api/customer/user_pools/send_sms`,
        type: 'POST',
    }
}