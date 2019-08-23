
import config from 'platform/config'


export default {
    // 获取模板列表
    getSignTemplateList: {
        url: `${config.apiHost}/api/sms/signatures`,
        type: 'GET',
    },
    // 店铺列表
    getShopList:{
        url: `${config.apiHost}/api/shops`,
        type: 'get',
    },
    // 新增模板
    postSignTemplate:{
        url: `${config.apiHost}/api/sms/signatures`,
        type: 'POST'
    },
    //删除模板
    deleteSignTemplate:{
        url: `${config.apiHost}/api/sms/signatures/`,
        type: 'DELETE'
    }

}
