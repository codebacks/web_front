import config from '../../../config'


export default {
    orderList: {
        url: `${config.yqxHost_init}/api/distributor/orders`,
        type: 'get',
    },
    orderDetail: {
        url: `${config.yqxHost_init}/api/distributor/orders/{order_id}`,
        type: 'get',
    },
}