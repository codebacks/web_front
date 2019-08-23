import config from 'community/config'

export default {
    detail: {
        url: `${config.apiHost}/setting_auto_confirm_friend`,
        type: 'GET',
    },
    update: {
        url: `${config.apiHost}/setting_auto_confirm_friend`,
        type: 'POST',
    },
    wechatUpdate: {
        url: `${config.apiHost}/setting_auto_confirm_friend/wechat`,
        type: 'POST',
    },
    groupAutoPass: {
        url: `${config.apiHost}/setting_group_auto_pass`,
        type: 'GET',
    },
    updateGroupAutoPass: {
        url: `${config.apiHost}/setting_group_auto_pass`,
        type: 'POST',
    },
}