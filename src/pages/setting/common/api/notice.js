/**
 **@Description:
 **@author:yecuilin
 */

import config from 'setting/config'

const api = {
    getNoticeList:{
        url: `${config.apiHost_wu}/api/notify/announcements`,
        type: 'GET',
    },
    setReadStatus:{
        url: `${config.apiHost_wu}/api/notify/announcements/{id}`,
        type: 'PUT',
    },
    getNoticeDetail:{
        url: `${config.apiHost_wu}/api/notify/announcements/{id}`,
        type: 'GET',
    }
}

export default api