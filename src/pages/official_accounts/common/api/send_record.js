
import config from '../../config'

const api = {
    //历史发送消息列表
    messageHistories:{
        url: `${config.apiHost}/api/message_histories`,
        type: 'GET',
    },
    //发送记录详情
    messageHistoriesDetail:{
        url: `${config.apiHost}/api/message_histories/{id}`,
        type: 'GET',
    },

}

export default api
