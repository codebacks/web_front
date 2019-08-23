
import config from 'platform/config'

export default {
    // 获取账户状态
    getAccountStatus: {
        url: `${config.apiHost}/api/doll/info`,
        type: 'GET',
    },
    // 开通服务
    openService: {
        url: `${config.apiHost}/api/doll/companies`,
        type: 'POST',
    },
}
