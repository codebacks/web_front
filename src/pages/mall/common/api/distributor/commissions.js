import config from '../../../config'

export default {
    commissionsList: {
        url: `${config.yqxHost_init}/api/distributor/withdrawals`,
        type: 'get',
    },
    pass: {
        url: `${config.yqxHost_init}/api/packets/reviews/{id}/pass`,
        type: 'POST',
    },
    transactions: {
        url: `${config.yqxHost_init}/api/distributor/withdrawals/{withdraw_id}/transactions`,
        type: 'POST',
    },
}