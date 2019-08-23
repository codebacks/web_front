'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [wuming]
 * 创建日期 16/10/6
 *
 */
import config from 'crm/config'

export default {
    //下单
    pressOrder: {
        url: `${config.apiHost_wu}/api/customer/user_pools/sms/order`,
        type: 'POST',
    },
    //支付
    payment: {
        url: `${config.apiHost_wu}/api/accounts/payments`,
        type: 'POST',
    },
    smsCount: {
        url: `${config.apiHost_wu}/api/sms/count`,
        type: 'get',
    },
    recharge:{
        url: `${config.apiHost_wu}/api/accounts/orders/{id}/charge`,
        type: 'POST',
    }
}