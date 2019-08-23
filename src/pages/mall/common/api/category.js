
import config from 'mall/config'

export default {
    getCategory: {
        url: `${config.yqxHost}/management/category`,
        type: 'GET',
    },
    addCategory: {
        url: `${config.yqxHost}/management/category`,
        type: 'POST',
    },
    deleteCategory: {
        url: `${config.yqxHost}/management/category`,
        type: 'DELETE',
    },
    updateCategory: {
        url: `${config.yqxHost}/management/category`,
        type: 'PUT',
    },
}