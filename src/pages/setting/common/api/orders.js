
import config from 'setting/config'

export default {
    getOrderList: {
        url: `${config.apiHost_wu}/api/order_histories`,
        type: 'GET',
    },
    saveOrder: {
        url: `${config.apiHost_wu}/api/order_histories`,
        type: 'POST',
    },
    saveMemo: {
        url: `${config.apiHost_wu}/api/order_histories`,
        type: 'PUT',
    },
    getFailItem: {
        url: `${config.apiHost_wu}/api/order_histories`,
        type: 'GET',
    },
    getShopOrderList: {
        url: `${config.apiHost_wu}/api/import_orders`,
        type: 'GET',
    },
}