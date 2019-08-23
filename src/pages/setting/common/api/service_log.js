import config from 'setting/config'

export default {
    getTableList: {
        url: `${config.apiHost_wu}/api/accounts/version/order`,
        type: 'GET',
    },
    afterSale: {
        url: `${config.apiHost_wu}/api/accounts/version/after_sale`,
        type: 'POST',
    }
}