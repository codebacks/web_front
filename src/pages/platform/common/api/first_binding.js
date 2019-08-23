import config from 'platform/config'
const api = {
    listData: {
        url: `${config.apiHost}/api/first_bindings`,
        type: 'GET',
    },
    create: {
        url: `${config.apiHost}/api/first_bindings`,
        type: 'POST',
    },
    activitiesDetail: {
        url: `${config.apiHost}/api/first_bindings/{activity_id}`,
        type: 'GET',
    },
    remove: {
        url: `${config.apiHost}/api/first_bindings/{activity_id}`,
        type: 'DELETE',
    },
    update: {
        url: `${config.apiHost}/api/first_bindings/{activity_id}`,
        type: 'PUT',
    },
    downline: {
        url: `${config.apiHost}/api/first_bindings/{activity_id}/offline`,
        type: 'POST',
    },
    graphicStatistics: {
        url: `${config.apiHost}/api/first_bindings/{activity_id}/statistics`,
        type: 'GET',
    },
    // 是否开通
    isOpen: {
        url: `${config.apiHost}/api/wx_mps`,
        type: 'get',
    },
    shops: {
        url: `${config.apiHost}/api/shops`,
        type: 'GET',
    }
}

export default api
