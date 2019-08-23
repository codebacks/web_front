import config from 'apps/config'

export default {
    apps: {
        url: `${config.apiOpenHost}/api/crm/apps`,
        type: 'GET',
    },
    previewApps: {
        url: `${config.apiOpenHost}/api/crm/preview_apps`,
        type: 'GET',
    },
    getGrantApps: {
        url: `${config.apiOpenHost}/api/crm/grant_apps`,
        type: 'GET',
    },
    grantApps: {
        url: `${config.apiOpenHost}/api/crm/grant_apps/{id}`,
        type: 'POST',
    },
    grantApp: {
        url: `${config.apiOpenHost}/api/crm/apps/{id}/grant`,
        type: 'POST',
    },
}
