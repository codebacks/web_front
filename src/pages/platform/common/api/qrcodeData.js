import config from 'platform/config'

export default {
    // 新码数据统计
    qrcodeData: {
        url: `${config.apiHost}/api/qrcodes/{id}/stats/{type}`,
        type: 'GET',
    },
    // 新码微信号统计
    qrcodeWechat:{
        url: `${config.apiHost}/api/qrcodes/{id}/wechats/stats`,
        type: 'get',
    },    
    downloadExports:{
        url:`${config.apiHost}/api/qrcodes/exportExecl`,
        type:'GET'
    },
    timeInterval:{
        url:`${config.apiHost}/api/qrcodes/exportExeclInterval`,
        type:'GET'
    }
}