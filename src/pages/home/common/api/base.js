import config from '../../config'

export default function(name) {
    return {
        list: {
            url: `${config.apiHost}/${name}`,
            type: 'GET',
        },
        create: {
            url: `${config.apiHost}/${name}`,
            type: 'POST',
        },
        detail: {
            url: `${config.apiHost}/${name}/{id}`,
            type: 'GET',
        },
        update: {
            url: `${config.apiHost}/${name}/{id}`,
            type: 'PUT',
        },
        remove: {
            url: `${config.apiHost}/${name}/{id}`,
            type: 'DELETE',
        },
    }
}