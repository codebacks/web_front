
import config from 'mall/config'
// 去掉空格
export default {
    getMerchantInfo: {
        url: `${config.yqxHost}/management/merchant`,
        type: 'GET',
    },
    getTradeInfo: {
        url: `${config.yqxHost}/management/merchant/stat/order`,
        type: 'GET',
    },
    getQRCode: {
        url: `${config.yqxHost}/management/mpa/code_url`,
        type: 'GET',
    },
    getStartEnd: {
        url: `${config.yqxHost}/management/statistics/nav`,
        type: 'GET',
    },
    getEchartsData: {
        url: `${config.yqxHost}/management/statistics`,
        type: 'GET',
    },
    getMapStatus: {
        url: `${config.yqxHost}/management/mpa/audit`,
        type: 'GET',
    },
}