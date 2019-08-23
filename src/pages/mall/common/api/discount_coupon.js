import config from '../../config'
const api = {
    // 优惠券列表
    couponDataList:{
        url:`${config.yqxHost}/management/coupon_templates`,
        type:'GET'
    },
    checkDetail:{
        url:`${config.yqxHost}/management/coupon_templates/{id}`,
        type:'GET'
    },
    // 商品列表
    goods: {
        url: `${config.yqxHost}/management/goods_sku/search`,
        type: 'GET',
    },
    createCoupon:{
        url: `${config.yqxHost}/management/coupon_templates`,
        type: 'POST',
    },
    getgoodsList:{
        url: `${config.yqxHost}/management/coupon_templates/{id}/coupon_goods`,
        type: 'GET',
    },
    echartsData:{
        url: `${config.yqxHost}/management/coupons/{id}/statistics`,
        type: 'GET',
    },
    couponData:{
        url: `${config.yqxHost}/management/coupons/{id}`,
        type: 'GET',
    },
    solidOut:{
        url: `${config.yqxHost}/management/coupon_templates/{id}/down`,
        type: 'POST',
    },
    putaway:{
        url: `${config.yqxHost}/management/coupon_templates/{id}/up`,
        type: 'POST',
    },
    cancellation:{
        url: `${config.yqxHost}/management/coupon_templates/{id}/cancel`,
        type: 'POST',
    }

}


export default api
