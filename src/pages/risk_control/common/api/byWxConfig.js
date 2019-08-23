import config from 'risk_control/config'

export default {
    query: {
        url: `${config.apiHost}/api/permission/wechat/wechats`,
        type: 'GET',
    },
    wxDivideOptions: {
        url: `${config.apiHost}/api/wechats/grouping`,
        type: 'GET',
    },
    getPermissionConfig: {
        url: `${config.apiHost}/api/permission/wechat/configurations`,
        type: 'GET',
    },
    setPermissionConfig: {
        url: `${config.apiHost}/api/permission/wechat/configurations/batch_setting`,
        type: 'POST',
    },
    getSinglePermission: {
        url: `${config.apiHost}/api/permission/wechat/configurations/{uin}`,
        type: 'GET',
    },
    setSinglePermission: {
        url: `${config.apiHost}/api/permission/wechat/configurations/{uin}`,
        type: 'POST',
    },
}
