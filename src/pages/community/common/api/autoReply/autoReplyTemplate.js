import config from 'community/config'

export default {
    query: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/templates`,
        type: 'GET',
    },
    add: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/templates`,
        type: 'POST',
    },
    edit: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/template/{template_id}`,
        type: 'PUT',
    },
    remove: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/template/{template_id}`,
        type: 'DELETE',
    },
    removeCheck: {
        url: `${config.apiHost}/setting_group_auto_reply_v3/template/{template_id}/delete_check`,
        type: 'GET',
    },
}