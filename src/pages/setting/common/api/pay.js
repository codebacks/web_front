/**
 **@time: 2018/8/9
 **@Description:微信支付配置接口
 **@author: wangchunting
 */

import config from 'setting/config'

const api = {
    // 列表
    payList: {
        url: `${config.apiHost_wu}/api/wx_merchants`,
        type: 'GET',
    },
    // 新增
    create: {
        url: `${config.apiHost_wu}/api/wx_merchants`,
        type: 'POST',
    },
    //删除
    remove: {
        url: `${config.apiHost_wu}/api/wx_merchants/{id}`,
        type: 'DELETE',
    },
    //修改
    update: {
        url: `${config.apiHost_wu}/api/wx_merchants/{id}`,
        type: 'PUT',
    },
    // 获取七牛上传文件token
    getToken: {
        url: `${config.apiHost_wu}/api/upload`,
        type: 'GET',
    },
    getEditModel: {
        url: `${config.apiHost_wu}/api/wx_merchants/{id}`,
        type: 'GET',
    },
}

export default api
