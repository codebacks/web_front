'use strict'

import config from 'data/config'
export default {
    getWechatReport: {
        url: `${config.apiHost_wu}/api/wechat/report`,
        type: 'POST',
    },
    getReportList: {
        url: `${config.apiHost_wu}/api/wechat/report/`,
        // url: `/api_mock/getReportList`,
        type: 'GET',
    },
    tryReportAgain: {
        url: `${config.apiHost_wu}/api/wechat/report/{id}`,
        type: 'POST',
    },
}
