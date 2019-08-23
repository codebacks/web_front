
import config from 'platform/config'


export default {
    // 获取短信模板列表
    getMsmTemplateList: {
        url: `${config.apiHost}/api/sms/templates`,
        type: 'GET',
    },
    // 获取短信模板详情
    getMsmTemplateDatail:{
        url: `${config.apiHost}/api/sms/templates/`,
        type: 'GET'
    },
    // 新增短信模板
    postMsmTemplate:{
        url: `${config.apiHost}/api/sms/templates`,
        type: 'POST'
    },
    //update短信模板
    putMsmTemplate:{
        url: `${config.apiHost}/api/sms/templates/`,
        type: 'PUT'
    },
    //删除短信模板
    deleteMsmTemplate:{
        url: `${config.apiHost}/api/sms/templates/`,
        type: 'DELETE'
    },
    // 新码
    qrcodes: {
        url: `${config.apiHost}/api/qrcodes`,
        type: 'GET',
    },

}
