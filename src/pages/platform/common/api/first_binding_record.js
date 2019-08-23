import config from 'platform/config'
const api = {
    listData: {
        url: `${config.apiHost}/api/first_bindings/join_records`,
        type: 'GET',
    },
}

export default api
