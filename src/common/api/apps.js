import config from 'config'

export default {
    getApp: {
        url: `${config.apiOpenHost}/api/crm/apps/{id}`,
        type: 'GET',
    },
    appsClick: {
        url: `${config.apiOpenHost}/api/crm/apps/{id}/click`,
        type: 'GET',
    },
    recentApps: {
        url: `${config.apiOpenHost}/api/crm/recent_apps`,
        type: 'GET',
    },
    deleteRecentApp: {
        url: `${config.apiOpenHost}/api/crm/recent_apps/{id}`,
        type: 'DELETE',
    },
    frequentApps: {
        url: `${config.apiOpenHost}/api/crm/frequent_apps`,
        type: 'GET',
    },
    addFrequentApps: {
        url: `${config.apiOpenHost}/api/crm/frequent_apps`,
        type: 'POST',
    },
    deleteFrequentApps: {
        url: `${config.apiOpenHost}/api/crm/frequent_apps/{id}`,
        type: 'DELETE',
    },
}
