import config from '../../config'

export default {
    getWeekStatistics: {
        url: `${config.apiHost}/api/packets/statistics`,
        type: 'GET',
    }
}