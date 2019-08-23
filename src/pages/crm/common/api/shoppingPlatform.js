import config from 'crm/config'

export default {
    members: {
        url: `${config.apiHost}/members`,
        type: 'GET',
    },
}
