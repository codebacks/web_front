import config from 'wx/config'

export default {
    autoReply: {
        url: `${config.apiHost}/setting_auto_reply`,
        type: 'GET',
    },
    autoReplyUpdate: {
        url: `${config.apiHost}/setting_auto_reply`,
        type: 'POST',
    },
    category: {
        url: `${config.apiHost}/setting_auto_reply/category/{category_id}`,
        type: 'GET',
    },
    categoryUpdate: {
        url: `${config.apiHost}/setting_auto_reply/category`,
        type: 'POST',
    },
    categoryDelete: {
        url: `${config.apiHost}/setting_auto_reply/category/{category_id}`,
        type: 'DELETE',
    },
    autoReplyOneUpdate: {
        url: `${config.apiHost}/setting_auto_reply/uin/{uin}`,
        type: 'POST',
    },
}