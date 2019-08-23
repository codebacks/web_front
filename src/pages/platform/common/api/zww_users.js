/*
 * @Author: sunlizhi 
 * @Date: 2018-11-30 16:58:27 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-12-05 18:02:58
 */

import config from 'platform/config'

export default {
    // 获取用户管理列表
    getUserManagementList: {
        url: `${config.apiHost}/api/doll/accounts`,
        type: 'GET',
    },
    // 账户记录
    accountRecord: {
        url: `${config.apiHost}/api/doll/accounts/{doll_id}`,
        type: 'GET',
    },
    // 账户发放记录
    sentRecords: {
        url: `${config.apiHost}/api/doll/sent_records`,
        type: 'GET',
    },
    // 账户消费记录
    consumeRecords: {
        url: `${config.apiHost}/api/doll/consume_records`,
        type: 'GET',
    },
}
