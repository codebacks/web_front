
import config from '../../config'

const api = {
    // 获取消息模板列表
    template_messages: {
        url: `${config.apiHost}/api/template_messages`,
        type: 'GET',
    },
    // 开启消息模板
    open_messages: {
        url: `${config.apiHost}/api/template_messages/{id}/open`,
        type: 'PUT',
    },
    // 关闭消息模板
    close_messages: {
        url: `${config.apiHost}/api/template_messages/{id}/close`,
        type: 'PUT',
    },
    // 消息模板详情
    templateMessagesDetail:{
        url: `${config.apiHost}/api/template_messages/{id}`,
        type: 'GET',
    },
    // 消息模板编辑
    putTemplateMessages:{
        url: `${config.apiHost}/api/template_messages/{id}`,
        type: 'PUT',
    },
    //历史发送消息列表
    messageHistories:{
        url: `${config.apiHost}/api/message_histories`,
        type: 'GET',
    },
    //发送记录详情
    messageHistoriesDetail:{
        url: `${config.apiHost}/api/message_histories/{id}`,
        type: 'GET',
    },

}

export default api
