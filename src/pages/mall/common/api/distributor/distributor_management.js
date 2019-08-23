import config from '../../../config'

export default {
    managementList: {
        url: `${config.yqxHost_init}/api/distributor/distributors`,
        type: 'get',
    },
    update: {
        url: `${config.yqxHost_init}/api/distributor/distributors/{disstributor_id}`,
        type: 'PUT',
    },

}
