import config from '../../config'

const api = {
    qrcodePrefixUrl: config.praiseRedPackageQrPrefix,
    qrcodeWxCodeUrl: config.praiseRedPackageQrPrefix,
    listData: {
        url: `${config.apiHost}/api/packets/activities`,
        type: 'GET',
    },
    create: {
        url: `${config.apiHost}/api/packets/activities`,
        type: 'POST',
    },
    shops: {
        url: `${config.apiHost}/api/shops`,
        type: 'GET',
    },
    qrcodes: {
        url: `${config.apiHost}/api/qrcodes`,
        type: 'GET',
    },
    downline: {
        url: `${config.apiHost}/api/packets/activities/{id}/down`,
        type: 'PUT',
    },
    statistics: {
        url: `${config.apiHost}/api/packets/activities/{id}/statistics`,
        type: 'GET',
    },
    remove: {
        url: `${config.apiHost}/api/packets/activities/{id}`,
        type: 'DELETE',
    },
    // 获取七牛上传文件token
    getToken: {
        url: `${config.apiHost}/api/upload`,
        type: 'GET',
    },
    qrcodesImg: {
        url: `${config.apiHost}/public/qrcodes/{id}.png`,
        type: 'GET',
    },
    //修改
    update: {
        url: `${config.apiHost}/api/packets/activities/{id}`,
        type: 'PUT',
    },
    // 是否开通
    isOpen: {
        url: `${config.apiHost}/api/wx_mps`,
        type: 'get',
    },
    // 商品列表
    goods: {
        url: `${config.apiHost}/api/goods`,
        type: 'get',
    },
}

export default api
