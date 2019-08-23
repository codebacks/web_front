import config from 'community/config'

export default {
    queryGlobal: {
        url: `${config.apiHost}/setting_group_auto_reply_v3`,
        type: 'GET',
    },
    getSetting: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/commons`,
        type: 'GET',
    },
    setSetting: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/commons`,
        type: 'POST',
    },
    getTemplates: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/templates`,
        type: 'GET',
    },
    getReplyContents: {
        url: `${config.apiHost}/knowledge_base/category/item/{id}`,
        type: 'GET',
    },
    getTemplateDetail: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/template/{template_id}/keywords`,
        type: 'GET',
    },
}
