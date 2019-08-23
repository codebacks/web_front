import config from 'crm/config'
export default {
    getSummary: {
        url: `${config.apiHost_wu}/api/points/stat/summary`,
        type: 'GET',
    },
    searchSummaryList:{
        url: `${config.apiHost_wu}/api/points/stat`,
        type: 'GET'
    },
    searchPointsList:{
        url: `${config.apiHost_wu}/api/points`,
        type: 'GET'
    },
    getsettingData:{
        url: `${config.apiHost_wu}/api/points/setting`,
        type: 'GET'                                 
    },
    pointsListDetail:{
        url: `${config.apiHost_wu}/api/points/{id}/log`,
        type: 'GET'
    },
    exportReport:{
        url: `${config.apiHost_wu}/api/points/export`,
        type: 'GET'
    },
    getGzhList:{
        url: `${config.apiHost_wu}/api/wx_mps`,
        type: 'GET'
    },
    getAuthshops:{
        url: `${config.apiHost_wu}/api/shops`,
        type: 'GET'
    },
    updateSetting:{
        url: `${config.apiHost_wu}/api/points/setting`,
        type: 'POST'
    },

    getExchangeList:{
        url: `${config.apiHost_wu}/api/points/orders`,
        type: 'GET'
    },
    exportOrder:{
        url: `${config.apiHost_wu}/api/points/orders/export`,
        type: 'GET'
    },
    deliverGoods:{
        url: `${config.apiHost_wu}/api/points/orders/{id}/consignment`,
        type: 'POST'
    },

    getMallList:{
        url: `${config.apiHost_wu}/api/points/shop`,
        type: 'GET'
    },
    getMallDetail:{
        url: `${config.apiHost_wu}/api/points/shop/{id}`,
        type: 'GET'
    },
    editMall:{
        url: `${config.apiHost_wu}/api/points/shop`,
        type: 'POST'
    },

    getAwardList:{
        url: `${config.apiHost_wu}/api/points/goods`,
        type: 'GET'
    },
    toggleAward:{
        url: `${config.apiHost_wu}/api/points/goods/batch`,
        type: 'POST'
    },
    deleteAward:{
        url: `${config.apiHost_wu}/api/points/goods`,
        type: 'DELETE'
    },
    getAwardDetail:{
        url: `${config.apiHost_wu}/api/points/goods/{id}`,
        type: 'GET'
    },
    editAward:{
        url: `${config.apiHost_wu}/api/points/goods`,
        type: 'POST'
    },
    getExpressList:{
        url: `${config.apiHost_wu}/api/points/orders/express`,
        type: 'GET'
    },
    changeIntegral:{
        url: `${config.apiHost_wu}/api/points/{id}`,
        type: 'PUT'
    },
}
