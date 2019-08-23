import config from 'community/config'

export default {
    query: {
        url: `${config.apiHost}/wechats/chat_rooms/groupings`,
        type: 'GET',
    },
    update: {
        url: `${config.apiHost}/wechats/chat_rooms/grouping/{id}`,
        type: 'PUT',
    },
    add: {
        url: `${config.apiHost}/wechats/chat_rooms/grouping`,
        type: 'POST',
    },
    deleteDivide: {
        url: `${config.apiHost}/wechats/chat_rooms/grouping/{id}`,
        type: 'DELETE',
    },



}