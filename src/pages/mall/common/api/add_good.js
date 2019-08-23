/*
 * @Author: sunlzhi 
 * @Date: 2018-10-20 19:28:21 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-10-26 16:35:11
 */

import config from 'mall/config'

export default {
    // 获取商品
    getGoods:{
        url: `${config.yqxHost}/management/goods/{id}`,
        type: 'GET',
    },
    // 创建商品
    createGoods:{
        url: `${config.yqxHost}/management/goods`,
        type: 'POST',
    },
    // 修改商品
    modifyGoods:{
        url: `${config.yqxHost}/management/goods/{id}`,
        type: 'PUT',
    },
    // 获取商品类目
    getCategory: {
        url: `${config.yqxHost}/management/category`,
        type: 'GET',
    },
    // 获取商品类目
    getPostage: {
        url: `${config.yqxHost}/management/postage`,
        type: 'GET',
    },
}