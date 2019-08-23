import config from 'data/config'

export default {
    getTableList: {
        url: `${config.apiHost_sh}/api/settlements`,
        type: 'GET'
    },
    getMchNo: {
        url: `${config.apiHost_sh}/api/wx_merchants/mch_no`
    },
    accountsDownLoad: {
        url: `${config.apiHost_sh}/api/settlements/download`,
        type: 'GET'
    },
    downLoadDetail: {
        url: `${config.apiHost_sh}/api/settlements/generate/report`,
        type: 'GET'
    },
    accountsDetailDownLoad: {
        url: `${config.apiHost_sh}/api/settlements/detailed/download`,
        type: 'GET'
    },

    createDetailRecords: {
        url: `${config.apiHost_sh}/api/packets/reports`,
        type: 'GET'
    },
}