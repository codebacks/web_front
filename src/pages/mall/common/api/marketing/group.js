/**
 * 文件说明: 特价 接口
 * ----------------------------------------
 * 创建用户: zhousong
 * 创建日期 18/10/08
 */
import config from '../../../config'

export default {
    getGoodsList: {
        url: `${config.yqxHost}/management/groupon_goods`,
        type: 'GET'
    },
    selectGoods: {
        url: `${config.yqxHost}/management/goods`,
        type: 'GET'
    },
    groupDetail: {
        url: `${config.yqxHost}/management/groupon_goods`,
        type: 'GET'
    },
    editGroup: {
        url: `${config.yqxHost}/management/groupon_goods`,
        type: 'PUT'
    },
    deleteGroup: {
        url: `${config.yqxHost}/management/groupon_goods`,
        type: 'DELETE'
    },
    addGroup: {
        url: `${config.yqxHost}/management/groupon_goods`,
        type: 'POST'
    },
}
