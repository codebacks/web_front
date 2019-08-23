import config from 'wx/config/index'

export default {
    query: {
        url: `${config.apiHost}/setting_auto_reply_v2/templates`,
        type: 'GET',
    },
    add: {
        url: `${config.apiHost}/setting_auto_reply_v2/templates`,
        type: 'POST',
    },
    edit: {
        url: `${config.apiHost}/setting_auto_reply_v2/template/{template_id}`,
        type: 'PUT',
    },
    remove: {
        url: `${config.apiHost}/setting_auto_reply_v2/template/{template_id}`,
        type: 'DELETE',
    },
    removeCheck: {
        url: `${config.apiHost}/setting_auto_reply_v2/template/{template_id}/delete_check`,
        type: 'GET',
    },
}