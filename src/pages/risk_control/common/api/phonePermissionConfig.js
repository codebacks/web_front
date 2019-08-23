import config from 'risk_control/config'

export default {
    getPhoneConfigSummary: {
        url: `${config.apiHost}/api/permission/device/configurations/overview`,
        type: 'GET',
    },
    query: {
        url: `${config.apiHost}/api/permission/device/devices/{config_key}`,
        type: 'GET',
    },
    moveOut: {
        url: `${config.apiHost}/api/permission/device/configurations/{config_key}`,
        type: 'DELETE',
    },
    addPermissionDevice: {
        url: `${config.apiHost}/api/permission/device/configurations/batch_setting`,
        type: 'POST',
    },
}
