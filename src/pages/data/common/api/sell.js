import config from 'data/config'

export default {
    querySellData: {
        url: `${config.apiHost_sh}/api/performance`,
        type: 'GET'
    },
    downloadSell: {
        url: `${config.apiHost_sh}/api/performance/export`,
        type: 'GET'
    },
    getTranslateSet: {
        url: `${config.apiHost_sh}/api/performance/settings`,
        type: 'GET'
    },
    setTranslateSet: {
        url: `${config.apiHost_sh}/api/performance/settings`,
        type: 'PUT'
    },
    getPerformanceDetail : {
        url: `${config.apiHost_sh}/api/performance/detail`,
        type: 'get'
    },
    updateData:{
        url: `${config.apiHost_sh}/api/performance/schedule`,
        type: 'POST'
    },

    getShopListOauth:{
        url: `${config.apiHost_sh}/api/shops/auth/shops`,
        type: 'GET',
    },
    queryUpdateStatus:{
        url: `${config.apiHost_sh}/api/performance/schedule/latest`,
        type: 'GET'
    },
    createStatement:{
        url: `${config.apiHost_sh}/api/performance/report/export`,
        type: 'POST'
    },
    createAgain:{
        url: `${config.apiHost_sh}/api/performance/report/export/{id}`,
        type: 'POST'
    },
    createStatementList:{
        url: `${config.apiHost_sh}/api/performance/report`,
        type: 'get'
    },
    updateDataList:{
        url: `${config.apiHost_sh}/api/performance/schedules`,
        type: 'POST'
    }
}