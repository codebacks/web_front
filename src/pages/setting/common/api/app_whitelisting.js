import config from 'setting/config'

const API = {
    list: {
        url: `${config.apiHost}/api/app_whitelist`,
        type: 'GET',
    },
    check: {
        url: `${config.apiHost}/api/app_whitelist/check`,
        type: 'GET',
    },
    allow: {
        url: `${config.apiHost}/api/app_whitelist/{on}`,
        type: 'PUT'
    },
    operate: {
        url: `${config.apiHost}/api/app_whitelist/{app_id}/{status}`,
        type: 'PUT',
    },
}

export default API
