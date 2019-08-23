
export const shopType = [
    // {value: 2, name: '淘宝', type: 'TaoBao'},
    // {value: 3, name: '天猫', type: 'TaoBao'},
    {value: -1, name: '淘宝/天猫', type: 'TaoBao'},
    {value: 5, name: '京东', type: 'JD'},
    {value: 6, name: '有赞', type: 'YouZan'},
    {value: 7, name: '自营', type: 'ZiYing'},
    {value: 999, name: '导入', type: ''}
]

export const platformType = [
    {value: 1, name: '淘宝/天猫', type: 'TaoBao'},
    {value: 2, name: '京东', type: 'JD'},
    {value: 20, name: '有赞', type: 'YouZan'},
    {value: 99, name: '自营', type: 'ZiYing'}
]

export const addedType = {
    search: {
        type: 1,
        text: '搜索加粉',
    }
}

// 状态
export const addedStatus = {
    fail: {
        status: -1,
        text: '加粉失败'
    },
    success: {
        status: 1,
        text: '加粉成功'
    },
    processing: {
        status: 2,
        text: '执行中'
    },
    successExecuted: {
        status: 3,
        text: '执行成功'
    },
    failedExecuted: {
        status: -2,
        text: '执行失败'
    }
}

// code
export const addedCode = {
    disconnection: {
        code: 9001,
        text: '设备不在线'
    },
    notFound: {
        code: 9002,
        text: '找不到好友'
    },
    exception: {
        code: 9003,
        text: '指令执行异常'
    },
    NotPassed: {
        code: 9004,
        text: '未通过'
    },
    friendsAlready: {
        code: 9005,
        text: '已经是好友'
    },
    repeatExecution: {
        code: 9006,
        text: '手机号重复执行加粉'
    },
    timeout: {
        code: 9008,
        text: '执行超时'
    },
    failedExecuted: {
        code: 9104,
        text: '执行失败'
    },
    clientCode: {
        code: 9901, // 9901： 客户端上报的错误信息
    }
}
