/**
 * 文件说明: 特价 接口
 * ----------------------------------------
 * 创建用户: zhousong
 * 创建日期 18/10/08
 */
import config from '../../../config'

export default {
    getGoodsList: {
        url: `${config.yqxHost}/management/special_goods`,
        type: 'GET'
    },
    modifyRank: {
        url: `${config.yqxHost}/management/special_goods/rank`,
        type: 'POST'
    },
    searchGoodsList: {
        url: `${config.yqxHost}/management/goods_sku/search`,
        type: 'GET'
    },
    editGoodInfo: {
        url: `${config.yqxHost}/management/special_goods`,
        type: 'GET'
    },
    saveNewGood: {
        url: `${config.yqxHost}/management/special_goods`,
        type: 'POST'
    },
    saveEditGood: {
        url: `${config.yqxHost}/management/special_goods`,
        type: 'PUT'
    },
    deleteSpecial: {
        url: `${config.yqxHost}/management/special_goods`,
        type: 'DELETE'
    }
}
