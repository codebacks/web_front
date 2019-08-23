import config from '../../config'

const api = {
    // 关注有礼列表
    attentionPrizeList: {
        url: `${config.apiHost}/api/wx_mps/follow_activity`,
        type: 'GET',
    },
    // 关注有礼详情
    attentionPrizeDetail:{
        url: `${config.apiHost}/api/wx_mps/follow_activity/{id}`,
        type: 'GET',
    },
    // 新增关注有礼
    postAttentionPrize: {
        url: `${config.apiHost}/api/wx_mps/follow_activity`,
        type: 'POST',
    },
    // 编辑关注有礼
    putAttentionPrize: {
        url: `${config.apiHost}/api/wx_mps/follow_activity/{id}`,
        type: 'PUT',
    },
    // 删除关注有礼
    deleteAttentionPrize: {
        url: `${config.apiHost}/api/wx_mps/follow_activity/{id}`,
        type: 'DELETE',
    },
    // 关注有礼统计
    recordAttentionPrize: {
        url: `${config.apiHost}/api/wx_mps/follow_activity/{id}/stats`,
        type: 'GET',
    },
    createQrcode:{
        url: `${config.apiHost}/api/wx_mps/follow_activity/{id}/qr`,
        type: 'post',
    }
}

export default api

