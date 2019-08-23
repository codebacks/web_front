import config from 'community/config'

export default {
    query: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/template/{template_id}/keywords`,
        type: 'GET',
    },
    addKeyword: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/template/{template_id}/keyword`,
        type: 'POST',
    },
    editKeyword: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/template/{template_id}/keyword/{keyword_id}`,
        type: 'PUT',
    },
    getReplyContents: {
        url: `${config.apiHost}/knowledge_base/category/item/{id}`,
        type: 'GET',
    },
    move: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/template/{template_id}/keyword/{keyword_id}/move`,
        type: 'PUT',
    },
    removeKeyword: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/template/{template_id}/keyword/{keyword_id}`,
        type: 'DELETE',
    },
}