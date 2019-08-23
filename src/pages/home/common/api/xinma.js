import config from '../../config'

export default {
    getWeekStatistics: {
        url: `${config.apiHost}/api/qrcodes/stats`,
        type: 'GET',
    }
}