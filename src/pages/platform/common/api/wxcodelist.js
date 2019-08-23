import config from 'platform/config'
export default {
    //获取新码list
    getwxList: {
        url: `${config.apiHost}/api/qrcodes`,
        type: 'GET',
    },
    //下载新码二维码
    downLoad:{
        url:`${config.apiHost}/public/qrcodes/{id}.png`,
        type:'GET'
    },
    getDownLoadApiUrl:{
        url:`${config.apiHost}/public/qrcodes`,
    },
    getShortUrl:{
        url:`${config.apiHost}/public/qrcodes/short/url/{id}`,
        type:'GET'
    },
    //新码编辑获取数据
    getCreateObj:{
        url: `${config.apiHost}/api/qrcodes/{id}`,
        type: 'GET',
    },
    //获取微信号列表
    getWxlistData:{
        url:`${config.apiHost}/api/qrcodes/{id}/wechats`,
        type: 'GET',
    },
    getWxlistDataNoId:{
        url:`${config.apiHost}/api/qrcodes/0/wechats`,
        type: 'GET',
    },
    createWxcode:{
        url:`${config.apiHost}/api/qrcodes`,
        type: 'POST',
    },
    //刪除微信号
    deleteWx:{
        url: `${config.apiHost}/api/qrcodes/{qr_id}/wechats/{wx_id}/{sign}`,
        type: 'DELETE',
    },   
    uploadBg:{
        url:`${config.apiHost}/api/upload`,
        type: 'GET',
    },
    cancleCreate:{
        url: `${config.apiHost}/api/qrcodes/wechats`,
        type: 'DELETE',
    },
    updateCreateObj:{
        url: `${config.apiHost}/api/qrcodes/{id}`,       
        type: 'PUT',
    },
    addWxNum:{
        url:`${config.apiHost}/api/qrcodes/wechats`,
        type:'POST'
    },
    
}