import config from 'setting/config'

export default {
    currentVersion: {
        url: `${config.apiHost_wu}/api/accounts/version`,
        type: 'GET',
    },
    createVersionOrder: {
        url: `${config.apiHost_wu}/api/accounts/version/order`,
        type: 'POST',
    },
    phoneList: {
        url: `${config.apiHost_wu}/api/accounts/version/phone`,
        type: 'GET',
    },
    upgradeVersionCharge:{
        url: `${config.apiHost_wu}/api/accounts/version/charge`,
        type: 'POST',
    },
    queryPayStatus:{
        url: `${config.apiHost_wu}/api/accounts/version/order/{id}`,
        type: 'GET',
    },
    queryOrderStatus:{
        url: `${config.apiHost_wu}/api/accounts/version/order/charge/{id}`,
        type: 'GET',
    }
}