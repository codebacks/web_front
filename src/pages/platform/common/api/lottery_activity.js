import config from 'platform/config'

export default {
    qrcodePrefixUrl: config.praiseRedPackageQrPrefix,
    // 抽奖活动列表
    getLotteryActivitiesList: {
        url: `${config.apiHost}/api/lottery/activities`,
        type: 'GET',
    },
    // 抽奖活动详情
    getLotteryActivities: {
        url: `${config.apiHost}/api/lottery/activities/{id}`,
        type: 'GET',
    },
    // 创建抽奖活动
    postLotteryActivities: {
        url: `${config.apiHost}/api/lottery/activities`,
        type: 'POST',
    },
    //编辑抽奖活动
    putLotteryActivities: {
        url: `${config.apiHost}/api/lottery/activities/{id}`,
        type: 'PUT',
    },
    // 删除抽奖活动
    deleteLotteryActivities: {
        url: `${config.apiHost}/api/lottery/activities/{id}`,
        type: 'DELETE',
    },
    // 抽奖纪录列表
    getLotteryRocordList: {
        url: `${config.apiHost}/api/lottery/records`,
        type: 'GET',
    },
    getLotteryRocord:{
        url: `${config.apiHost}/api/lottery/records/{id}`,
        type: 'GET',
    },
    // 编辑抽奖活动记录
    putLotteryRocord: {
        url: `${config.apiHost}/api/lottery/records/{id}`,
        type: 'PUT',
    },
    // 抽奖活动下线
    activitiesDown: {
        url: `${config.apiHost}/api/lottery/activities/{id}/down`,
        type: 'PUT',
    },
    // 抽奖活动统计
    getActivitiesStat: {
        url: `${config.apiHost}/api/lottery/activities/{id}/stat`,
        type: 'GET',
    },
    getQrCode:{
        url: `/public/lottery/activities/{id}/auth`,
        type: 'GET',
    },
    // 奖品发放
    sendGrant:{
        url: `${config.apiHost}/api/lottery/records/{id}/grant`,
        type: 'POST',
    }
}

