import config from 'wx/config'

export default {
    setting: {
        url: `${config.apiHost}/setting_auto_handle`,
        type: 'GET',
    },
    settingUpdate: {
        url: `${config.apiHost}/setting_auto_handle`,
        type: 'POST',
    },
}