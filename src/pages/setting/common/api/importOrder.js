import config from '../../config'

export default {
    getOrderList: {
        url: `${config.apiHost_wu}/api/import_orders`,
        type: 'GET',
    },
    getOrderInfo: {
        url: `${config.apiHost_wu}/api/import_orders/detailed`,
        type: 'GET',
    },
    get: {
        url:`${config.apiHost_wu}/api/import_orders/{id}`
    },
    exportOrder: {
        url:`${config.apiHost_wu}/api/wei/orders/export`,
        type: 'GET',
    },
    importLogistics: {
        url:`${config.apiHost_wu}/api/wei/orders/import`,
        type: 'GET',
    },
}