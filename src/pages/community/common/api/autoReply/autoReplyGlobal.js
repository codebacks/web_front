import config from 'community/config'

export default {
    query: {
        url: `${config.apiHost}/setting_group_auto_reply_v3`,
        type: 'GET',
    },
    setStatus: {
        url: `${config.apiHost}/setting_group_auto_reply_v3`,
        type: 'POST',
    },
    addKeyword: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/company_keyword`,
        type: 'POST',
    },
    editKeyword: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/company_keyword/{keyword_id}`,
        type: 'PUT',
    },
    getReplyContents: {
        url: `${config.apiHost}/knowledge_base/category/item/{id}`,
        type: 'GET',
    },
    move: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/company_keyword/{keyword_id}/move`,
        type: 'PUT',
    },
    removeKeyword: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/company_keyword/{keyword_id}`,
        type: 'DELETE',
    },
}