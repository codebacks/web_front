import config from 'config'

export default {
    getGoodsList: {
        url: `${config.apiRetailHost}/api/goods`,
        type: 'GET',
    },
}
