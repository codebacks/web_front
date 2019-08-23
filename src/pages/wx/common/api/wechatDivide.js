import config from 'wx/config'

export default {
    query: {
        url: `${config.apiHost}/wechats/grouping`,
        type: 'GET',
    },
    update: {
        url: `${config.apiHost}/wechats/grouping/{group_id}`,
        type: 'PUT',
    },
    add: {
        url: `${config.apiHost}/wechats/grouping`,
        type: 'POST',
    },
    deleteDivide: {
        url: `${config.apiHost}/wechats/grouping/{group_id}`,
        type: 'DELETE',
    },
}