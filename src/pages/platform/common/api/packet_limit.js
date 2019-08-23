import config from 'platform/config'

export default {
    // 红包限额列表
    accountLimitList: {
        url: `${config.apiHost}/api/packets/account_limits`,
        type: 'GET',
    },
    // 编辑红包限额
    editAccountLimit: {
        url: `${config.apiHost}/api/packets/account_limits/settings`,
        type: 'POST',
    },
}