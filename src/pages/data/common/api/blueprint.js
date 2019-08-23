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
    accountsDetailDownLoad: {
        url: `${config.apiHost_sh}/api/settlements/detailed/download`,
        type: 'GET'
    }
}