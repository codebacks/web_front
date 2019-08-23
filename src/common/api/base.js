import config from 'config'

export default function(name) {
    return {
        list: {
            url: `${config.apiHost}/api/${name}`,
            type: 'GET',
        },
        create: {
            url: `${config.apiHost}/api/${name}`,
            type: 'POST',
        },
        detail: {
            url: `${config.apiHost}/api/${name}/{id}`,
            type: 'GET',
        },
        update: {
            url: `${config.apiHost}/api/${name}/{id}`,
            type: 'PUT',
        },
        remove: {
            url: `${config.apiHost}/api/${name}/{id}`,
            type: 'DELETE',
        },
    }
}
