import config from 'wx/config/index'

export default {
    query: {
        url: `${config.apiHost}/setting_auto_reply_v2/template/{template_id}/keywords`,
        type: 'GET',
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