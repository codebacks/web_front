import config from 'wx/config'

const API = {
    // 获取授权步骤
    procedure: {
        url: `${config.yqxHostInit}/procedure`,
        type: 'GET',
    },
    // 小程序审核状态  2-审核中 1-成功
    mpaAudit: {
        url: `${config.yqxHost}/management/mpa/audit`,
        type: 'GET',
    },
    // 商品列表
    goods: {
        url: `${config.yqxHost}/management/goods`,
        type: 'GET',
    },
    // 商家信息
    merchant: {
        url: `${config.yqxHost}/management/merchant`,
        type: 'GET',
    },
    // 生成小程序葵花码
    mpaCode: {
        url: `${config.yqxHost}/management/get_mpa_code`,
        type: 'GET',
    },
}

export default API
