import config from '../../config'

const api = {
    // 粉丝统计
    getFanStatic: {
        url: `${config.apiHost}/api/wx_mps/fans/{app_id}/stats`,
        type: 'GET',
    },
    getFanList: {
        url: `${config.apiHost}/api/wx_mps/fans/{app_id}`,
        type: 'GET',
    },
    getAppId: {
        url: `${config.apiHost}/api/wx_mps`,
        type: 'GET',
    },
}

export default api

