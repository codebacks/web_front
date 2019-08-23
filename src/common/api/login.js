import config from 'config'

export default {
    login: {
        url: `${config.apiHost}/api/auth/token`,
        type: 'POST',
    },
    logout: {
        url: `${config.apiHost}/api/auth/token`,
        type: 'DELETE',
    },
}