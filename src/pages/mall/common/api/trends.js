
import config from 'mall/config'

export default {
    addShortTrend: {
        url: `${config.yqxHost}/management/feed`,
        type: 'POST',
    },
    addLongTrend: {
        url: `${config.yqxHost}/management/feed`,
        type: 'POST',
    },
    getTrendList: {
        url: `${config.yqxHost}/management/feed`,
        type: 'GET',
    },
    getTrendDetail: {
        url: `${config.yqxHost}/management/feed`,
        type: 'GET',
    },
    deleteTrend: {
        url: `${config.yqxHost}/management/feed`,
        type: 'DELETE',
    },
    updateTrend: {
        url: `${config.yqxHost}/management/feed`,
        type: 'PUT',
    },
    getTrendComment: {
        url: `${config.yqxHost}/management/comment`,
        type: 'GET',
    },
    postComment: {
        url: `${config.yqxHost}/management/comment`,
        type: 'POST',
    },
}