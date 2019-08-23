import config from '../../config'

export default {
    getLinkList: {
        url: `${config.apiHost}/api/goods_recommend_statistics`,
        type: 'GET',
    },
    getGoodsList: {
        url: `${config.apiHost}/api/goods`,
        type: 'GET',
    },
    getShopListOauth: {
        url: `${config.apiHost}/api/shops/platform_shops`,
        type: 'GET',
    },
    oneClickSetAll: {
        url: `${config.apiHost}/api/wechat_to_taobaos/batch`,
        type: 'POST',
    },
    setWetoTao: {
        url: `${config.apiHost}/api/wechat_to_taobaos`,
        type: 'POST',
    },
    goodsDeleteWe: {
        url: `${config.apiHost}/api/wechat_to_taobaos/goods`,
        type: 'DELETE',
    },
    deleteWe: {
        url: `${config.apiHost}/api/wechat_to_taobaos`,
        type: 'DELETE',
    },



    getsendDatalist:{
        url: `${config.apiHost}/api/goods_recommend_statistics/{id}/records`,
        type: 'GET',
    },
    getGoodItemInfo:{
        url: `${config.apiHost}/api/goods/{id}`,
        type: 'GET',
    },
    getGoodsrecommendInfo:{
        url: `${config.apiHost}/api/goods_recommend_statistics/{id}`,
        type: 'GET',
    }

}