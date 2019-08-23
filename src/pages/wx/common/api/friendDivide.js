import config from 'wx/config'

export default {
    query: {
        url: `${config.apiHost}/wechats/friends/grouping`,
        type: 'GET',
    },
    update: {
        url: `${config.apiHost}/wechats/friends/grouping/{group_id}`,
        type: 'PUT',
    },
    add: {
        url: `${config.apiHost}/wechats/friends/grouping`,
        type: 'POST',
    },
    deleteDivide: {
        url: `${config.apiHost}/wechats/friends/grouping/{group_id}`,
        type: 'DELETE',
    },
}