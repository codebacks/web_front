
import config from 'platform/config'

export default {
    // 获取派送结算列表
    getAccountList: {
        url: `${config.apiHost}/api/doll/orders`,
        type: 'GET',
    },
    // 结算
    payment:{
        url: `${config.apiHost}/api/doll/links/settlement`,
        type: 'POST',
    },
    //游戏币发送历史记录
    sendGameCurrencyList:{
        url: `${config.apiHost}/api/doll/sent_records`,
        type: 'GET',
    },
    //结算记录
    settleRcordList:{
        url: `${config.apiHost}/api/doll/settlements`,
        type: 'GET',
    },
}
