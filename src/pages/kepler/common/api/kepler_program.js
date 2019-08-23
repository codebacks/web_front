import config from '../../config'

export default {
    getKeplerCardList: {
        url: `${config.yqxHost_init}/api/kepler/card`,
        type: 'GET'
    },
    getGroupList: {
        url: `${config.yqxHost_init}/api/kepler/card/categories`,
        type: 'GET'
    },
    addGroup: {
        url: `${config.yqxHost_init}/api/kepler/card/categories`,
        type: 'POST'
    },
    createCard: {
        url: `${config.yqxHost_init}/api/kepler/card`,
        type: 'POST'
    },
    cardConfig: {
        url: `${config.yqxHost_init}/api/kepler/card/config`,
        type: 'POST'
    },
    deleteCard: {
        url: `${config.yqxHost_init}/api/kepler/card`,
        type: 'DELETE'
    },
    moveCardGroup: {
        url: `${config.yqxHost_init}/api/kepler/card`,
        type: 'PUT'
    },
}