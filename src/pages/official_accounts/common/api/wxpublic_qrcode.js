import config from '../../config'

const api = {
    // 带参二维码列表
    qrcodeList: {
        url: `${config.apiHost}/api/wx_mps/qrcodes/`,
        type: 'GET',
    },
    // 获取带参二维码详情
    qrcodeDetail: {
        url: `${config.apiHost}/api/wx_mps/qrcodes/{id}`,
        type: 'GET',
    },
    // 新增带参二维码
    postQrcode: {
        url: `${config.apiHost}/api/wx_mps/qrcodes`,
        type: 'POST',
    },
    // 编辑带参二维码
    putQrcode: {
        url: `${config.apiHost}/api/wx_mps/qrcodes/{id}`,
        type: 'PUT',
    },
    // 删除带参二维码
    deleteQrcode: {
        url: `${config.apiHost}/api/wx_mps/qrcodes/{id}`,
        type: 'DELETE',
    },
    // 带参二维码明细列表
    recordQrcode: {
        url: `${config.apiHost}/api/wx_mps/qrcodes/bind/items/{qrcode_id}`,
        type: 'GET',
    }
}

export default api
