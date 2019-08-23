
import config from 'platform/config'


export default {
    // 获取短信发送列表
    getMsmSendList: {
        url: `${config.apiHost}/api/sms/send_histories`,
        type: 'GET',
    },
    // 查看报告
    getMsmSendReportList: {
        url: `${config.apiHost}/api/sms/send_histories/`,
        type: 'GET'
    }
}