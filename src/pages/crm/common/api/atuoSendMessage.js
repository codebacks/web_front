import config from '../../config'

const api = {
    // 自动发送规则列表
    autoSendList: {
        url: `${config.apiHost_wu}/api/sms/auto_send_rules`,
        type: 'GET',
    },
     // 自动发送规则详情
     getAutoSend: {
        url: `${config.apiHost_wu}/api/sms/auto_send_rules/{id}`,
        type: 'GET',
    },
    // 新增发送规则
    postAutoSend: {
        url: `${config.apiHost_wu}/api/sms/auto_send_rules`,
        type: 'POST',
    },
    // 开关发送规则
    putOpenAutoSend: {
        url: `${config.apiHost_wu}/api/sms/auto_send_rules/{id}`,
        type: 'PUT',
    },
    // 删除发送规则
    deleteAutoSend: {
        url: `${config.apiHost_wu}/api/sms/auto_send_rules/{id}`,
        type: 'DELETE',
    },

    // 查询短信配置信息
    getAutoSendRules: {
        url: `${config.apiHost_wu}/api/sms/config`,
        type: 'GET',
    },

    postAutoSendRules: {
        url: `${config.apiHost_wu}/api/sms/config`,
        type: 'POST',
    },

    // 编辑短信自动加粉
    putAutoSendRules: {
        url: `${config.apiHost_wu}/api/sms/config/{id}`,
        type: 'PUT',
    },
    
}
export default api
