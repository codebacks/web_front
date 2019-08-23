import config from 'config'

export default {
    media: {
        url: `${config.apiHost}/api/media`,
        type: 'GET',
    },
    tags: {
        url: `${config.apiHost}/api/media/tags`,
        type: 'GET',
    },
    categoriesTree: {
        url: `${config.apiHost}/api/media/categories/tree`,
        type: 'GET',
    },
    batchAdd: {
        url: `${config.apiHost}/api/media/batch_add`,
        type: 'POST',
    },
    articlesExtract: {
        url: `${config.apiHost}/api/cloud_control/tasks/articles/extract`,
        type: 'POST',
    },
}
