import config from 'wx/config/index'

export default {
    getSetting: {
        url: `${config.apiHost}/setting_auto_reply_v2/uin/{uin}`,
        type: 'GET',
    },
    queryGlobal: {
        url: `${config.apiHost}/setting_auto_reply_v2`,
        type: 'GET',
    },
    getTemplates: {
        url: `${config.apiHost}/setting_auto_reply_v2/templates`,
        type: 'GET',
    },
    setSetting: {
        url: `${config.apiHost}/setting_auto_reply_v2/uin/{uin}`,
        type: 'POST',
    },
    addKeyword: {
        url: `${config.apiHost}/setting_auto_reply_v2/template/{template_id}/keyword`,
        type: 'POST',
    },
    editKeyword: {
        url: `${config.apiHost}/setting_auto_reply_v2/template/{template_id}/keyword/{keyword_id}`,
        type: 'PUT',
    },
    getReplyContents: {
        url: `${config.apiHost}/knowledge_base/category/item/{id}`,
        type: 'GET',
    },
    move: {
        url: `${config.apiHost}/setting_auto_reply_v2/template/{template_id}/keyword/{keyword_id}/move`,
        type: 'PUT',
    },
    removeKeyword: {
        url: `${config.apiHost}/setting_auto_reply_v2/template/{template_id}/keyword/{keyword_id}`,
        type: 'DELETE',
    },
}