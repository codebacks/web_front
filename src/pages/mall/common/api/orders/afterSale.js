/**
 * 文件说明: 订单列表 接口
 * ----------------------------------------
 * 创建用户: zhousong
 * 创建日期 18/10/16
 */
import config from '../../../config'

export default {
    getAfterOrderList: {
        url: `${config.yqxHost}/management/aftersale`,
        type: 'GET'
    },
    editAfterOrder: {
        url: `${config.yqxHost}/management/aftersale`,
        type: 'PUT'
    }
}
