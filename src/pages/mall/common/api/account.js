import config from 'mall/config'
export default {
    // 账户列表
    accountList:{
        url: `${config.yqxHost}/management/settlement`,
        type: 'get',
    },
    //账户详情列表
    accountDetailList:{
        url: `${config.yqxHost}/management/settlement/{id}/payment`,
        type: 'get',
    },
    //账户列表详情
    accountDetail:{
        url: `${config.yqxHost}/management/settlement/{id}`,
        type: 'get',
    },
    // 近7日账户收入金额
    getSeventIncome:{
        url: `${config.yqxHost}/management/settlement/stat/income`,
        type: 'get',
    }
}