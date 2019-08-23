import config from 'mall/config'
export default {
    // 店铺列表
    shopList:{
        url: `${config.apiHost}/api/shops/auth/shops`,
        type: 'get',
    },
    //是否开通小红包功能
    checkPacket:{
        url: `${config.apiHost}/api/wx_mps`,
        type: 'get',
    },
    tableList:{
        url: `${config.apiHost}/api/packets`,
        type: 'get',
    },
    // 获取运费模板列表 or 详情
    getCarriageTemplateListOrDetail:{
        url:`${config.yqxHost}/management/postage`,
        type:'get'
    },
    // 新增运费模板
    increaseCarriageTemplate:{
        url:`${config.yqxHost}/management/postage`,
        type:'POST'
    },
    // 修改运费模板
    updateCarriageTemplate:{
        url:`${config.yqxHost}/management/postage/`,
        type:'PUT'
    },
    // 删除运费模板
    deleteCarriageTemplate:{
        url:`${config.yqxHost}/management/postage/`,
        type:'DELETE'
    },
    // 取商家运费计算方式修改
    putPostageType:{
        url:`${config.yqxHost}/management/merchant/postage_type`,
        type:'PUT'
    },
}