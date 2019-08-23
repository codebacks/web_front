/**
 * 文件说明: 订单列表 接口
 * ----------------------------------------
 * 创建用户: zhousong
 * 创建日期 18/10/15
 */
import config from '../../../config'

export default {
    getOrderList: {
        url: `${config.yqxHost}/management/order`,
        type: 'GET'
    },
    getOrderSetting: {
        url: `${config.yqxHost}/management/merchant`,
        type: 'GET'
    },
    resetOrderSetting: {
        url: `${config.yqxHost}/management/merchant`,
        type: 'PUT'
    },
    editTotalPrice: {
        url: `${config.yqxHost}/management/order`,
        type: 'PUT'
    },
    getExpress: {
        url: `${config.yqxHost}/management/order/express`,
        type: 'GET'
    },
    orderExport: {
        url: `${config.yqxHost}/management/order/export`,
        type: 'GET'
    }
}
