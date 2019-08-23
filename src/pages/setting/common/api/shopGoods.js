import config from '../../config'

export default {
    getGoodsList: {
        url: `${config.apiHost_wu}/api/goods`,
        type: 'GET',
    },
    updateGoods: {
        url: `${config.apiHost_wu}/api/goods/update`,
        type: 'POST'
    },
    getShopListOauth: {
        url: `${config.apiHost_wu}/api/shops/platform_shops`,
        type: 'GET',
    },
    getImportList:{
        url: `${config.apiHost_wu}/api/goods/import/status`,
        type: 'GET',
    },
    importGoods:{
        url: `${config.apiHost_wu}/api/goods/import`,
        type: 'POST',
    }
}
