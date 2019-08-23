import config from 'mall/config'

export default {
    // 用户列表
    customerList:{
        url: `${config.yqxHost}/management/user`,
        type: 'get',
    },
    // 编辑姓名
    editName:{
        url: `${config.yqxHost}/management/user/{id}`,
        type: 'put',
    },
    // 用户订单列表
    customerOrderList:{
        url: `${config.yqxHost}/management/user/{id}/orders`,
        type: 'get',
    }
}