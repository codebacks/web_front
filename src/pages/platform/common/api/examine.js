import config from 'platform/config'

const api = {
    //审核列表
    listData: {
        url: `${config.apiHost}/api/packets/reviews`,
        type: 'GET',
    },
    // 活动详情
    activitiesDetail: {
        url: `${config.apiHost}/api/packets/activities/{id}`,
        type: 'GET',
    },
    // 订单详情
    orderDetail: {
        url: `${config.apiHost}/api/import_orders/{id}`,
        type: 'GET',
    },
    // 审核通过
    pass: {
        url: `${config.apiHost}/api/packets/reviews/{id}/pass`,
        type: 'POST',
    },
    // 审核批量通过
    batchPass: {
        url: `${config.apiHost}/api/packets/reviews/batch_pass`,
        type: 'POST',
    },
    // 审核拒绝
    reject: {
        url: `${config.apiHost}/api/packets/reviews/{id}/reject`,
        type: 'POST',
    },
    // 审核记录批量拒绝
    batchReject: {
        url: `${config.apiHost}/api/packets/reviews/batch_reject`,
        type: 'POST',
    },
    // 审核手动确认
    confirm: {
        url: `${config.apiHost}/api/packets/reviews/{id}/confirm`,
        type: 'POST',
    },
    // 审核批量手动确认
    batchConfirm: {
        url: `${config.apiHost}/api/packets/reviews/batch_confirm`,
        type: 'POST',
    },
    // 审核记录批量删除
    batchDelete: {
        url: `${config.apiHost}/api/packets/reviews/batch`,
        type: 'DELETE',
    },
    // 审核记录删除
    remove: {
        url: `${config.apiHost}/api/packets/reviews/{id}`,
        type: 'DELETE',
    },
    // 审核详情
    reviewsDetail: {
        url: `${config.apiHost}/api/packets/reviews/{id}`,
        type: 'GET',
    },
    // 付款失败详情
    failPaymentDetail: {
        url: `${config.apiHost}/api/packets/reviews/payment`,
        type: 'GET',
    },
    activity_shops: {
        url: `${config.apiHost}/api/shops/shop_list`,
        type: 'GET',
    },
    sync_order: {
        url: `${config.apiHost}/api/packets/reviews/{id}/sync_order`,
        type: 'GET',
    },

}

export default api
