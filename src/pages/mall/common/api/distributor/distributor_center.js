import config from '../../../config'

export default {
    centerList: {
        url: `${config.yqxHost_init}/api/distributor/info`,
        type: 'get',
    },
    create: {
        url: `${config.yqxHost_init}/api/distributor/info`,
        type: 'POST',
    },
    update: {
        url: `${config.yqxHost_init}/api/distributor/info`,
        type: 'PUT',
    },
    isOpen: {
        url: `${config.yqxHost_init}/api/wx_mps`,
        type: 'get',
    },
}
