import config from '../../config'

export default {
    get: {
        url: `${config.apiHostWx}/api/general`,
        type: 'GET',
    },
    getSetting: {
        url: `${config.apiHost}/api/performance/settings`,
        type: 'GET'
    },
    setSetting: {
        url: `${config.apiHost}/api/performance/overview/settings`,
        type: 'PUT'
    },
    getTopSells: {
        url: `${config.apiHost}/api/performance/overview/rank`,
        type: 'GET'
    },
    getPerformances: {
        url: `${config.apiHost}/api/performance/overview/stat`,
        type: 'GET'
    }
}