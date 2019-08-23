import config from 'setting/config'

export default {
    getDevelopInfo: {
        url: `${config.apiHost_wu}/api/company/develop/show`,
        // url: `/api_mock/company/develop/show`,
        type: 'GET',
    },
    newDevelopInfo: {
        url: `${config.apiHost_wu}/api/company/develop/setting`,
        // url: `/api_mock/company/develop/setting`,
        type: 'POST',
    },
    resetDevelopInfo: {
        url: `${config.apiHost_wu}/api/company/develop/setting`,
        // url: `/api_mock/company/develop/setting`,
        type: 'PUT',
    },
}
