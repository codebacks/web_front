import config from 'risk_control/config'

export default {
    getWxConigSummary: {
        url: `${config.apiHost}/api/permission/wechat/configurations/overview`,
        type: 'GET',
    },
    query: {
        url: `${config.apiHost}/api/permission/wechat/wechats/{config_key}`,
        type: 'GET',
    },
    moveOut: {
        url: `${config.apiHost}/api/permission/wechat/configurations/{config_key}`,
        type: 'DELETE',
    },
    addPermissionWechat: {
        url: `${config.apiHost}/api/permission/wechat/configurations/batch_setting`,
        type: 'POST',
    },
}
