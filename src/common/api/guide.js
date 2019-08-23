import config from 'config'

const api = {
    guidances: {
        url: `${config.apiRetailHost}/api/resource/guidances`,
        type: 'GET',
    },
    hideGuidances: {
        url: `${config.apiRetailHost}/api/resource/guidances/hide`,
        type: 'GET',
    }
}

export default api