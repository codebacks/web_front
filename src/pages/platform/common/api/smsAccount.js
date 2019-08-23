
import config from 'platform/config'


export default {
    // 购买记录列表
    getBuySMSList: {
        url: `${config.apiHost}/api/sms/buy_records`,
        type: 'GET',
    },
    // 短信剩余条数
    getSMSCount: {
        url: `${config.apiHost}/api/sms/count`,
        type: 'GET',
    },
}