import config from 'mall/config'

export default {
    // 商品列表
    goodsList: {
        url: `${config.yqxHost}/management/goods`,
        type: 'GET',
    },
    // 商品上下架
    goodsBatch: {
        url: `${config.yqxHost}/management/goods/batch`,
        type: 'PUT',
    },
    // 商品推荐取消
    batchRecommend: {
        url: `${config.yqxHost}/management/goods/batch_recommend`,
        type: 'PUT',
    },
    // 删除商品
    batchDelete: {
        url: `${config.yqxHost}/management/goods/batch`,
        type: 'DELETE',
    },
    // 佣金比例设置
    commissionUpdate: {
        url: `${config.yqxHost}/management/goods/{id}/commission_rate`,
        type: 'PUT',
    },
    updateVirtualSales: {
        url: `${config.yqxHost}/management/goods/{id}/virtual_sales`,
        type: 'PUT',
    },
    getPlatformShops: {
        url: `${config.yqxHost_init}/api/shops/platform_shops`,
        type: 'GET',
    },
    getCategory: {
        url: `${config.yqxHost}/management/shop_goods_imports/`,
        type: 'GET',
    },
    goodsBatchImport: {
        url: `${config.yqxHost}/management/shop_goods_imports`,
        type: 'POST',
    }
}