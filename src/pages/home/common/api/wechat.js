import config from '../../config'

export default {
    getFriendStatictics: {
        url: `${config.apiHostWx}/api/stats/friend`,
        type: 'GET',
    },
    getGroupStatictics: {
        url: `${config.apiHostWx}/api/stats/wx_group`,
        type: 'GET',
    }
}