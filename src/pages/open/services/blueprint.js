import { stringify } from 'qs'
import request from '../../../utils/request'
import api from '../common/api/blueprint'
import apiExamine from '../common/api/examine'
import { format } from 'utils'
import _ from 'lodash'

function getExamine(items, value) {
    const v = _.toInteger(value)
    const type = _.find(items, c => c.value === v)
    return type && type.text
}

/**
 * 获取二维码Url
 * @method getQrCodeUrl
 * @param {string} releativeUrl 相对url
 * @returns 
 */
export function getQrCodeUrl(releativeUrl) {
    return api.qrcodePrefixUrl + releativeUrl
}

export function getWxCodeQrCodeUrl(releativeUrl) {
    return api.qrcodeWxCodeUrl + releativeUrl
}

//活动状态
export const ACTIVIT_STATUS = [
    { value: 3, text: '未开始', code: 'rough' },
    { value: 1, text: '进行中', code: 'delay' },
    { value: 2, text: '已结束', code: 'finish' },
]
export function getActivitieStatus(value) {
    return getExamine(ACTIVIT_STATUS, value)
}

export function getActivitieCode(code, value) {
    return ACTIVIT_STATUS.find(item => item.code === code, value)
}

// 参与限制
export const LIMIT_TYPE = {
    'limit': 3,//无限次
    'limitDayValue': 1,//限制天数
    'limitSecondValue': 2//限制次数
}

// 活动过滤
export const IS_PARALLEL = {
    'isParallel': true,//不过滤
    'unIsParallel': false,//过滤
}

// 活动引流
export const GUIDE_TYPE = {
    'unGuider': false,//不引流
    'guider': true,//引流
    'syncCode': 1,//同步新码
    'custom': 2//自定义
}

// 审核方式
export const AUDIT_MODE = {
    'manualAudit': 1, //手动审核
    'automaticAudit': 2 //自动审核
}
// 参与商品
export const GOODS_RULE = {
    'allGoods': 1, //所有商品参与
    'appointGoods': 2 //指定商品参与
}



// 审核方式
export const AUDIT_CONDITION = [
    { value: 1, text: '双方互评且好评'},
    { value: 2, text: '买家评价即返现'},
    { value: 3, text: '订单完成即返现'},
]
export function getAuditCondition(value) {
    return getExamine(AUDIT_CONDITION, value)
}

// // 店铺类型
// export const SHOP_TYPE = [
//     { value: 2, text: '淘宝', name: 'TaoBao' },
//     { value: 3, text: '天猫', name: 'TianMao' },
//     { value: 5, text: '京东', name: 'JD' },
//     { value: 6, text: '有赞', name: 'YouZan' },
//     { value: 1, text: '虎赞小店', name: 'HuZan' },
//     { value: 7, text: '自营', name: 'ZiYing' },
// ]

// export function getShopValByName(value) {
//     return getExamine(SHOP_TYPE, value)
// }



// 获取审核列表
export async function listData(params) {
    return request(`${api.listData.url}?${stringify(params)}`)
}

// 创建活动
export async function create(params) {
    return request(api.create.url, {
        method: api.create.type,
        body: params,
    })
}
// 获取店铺列表
export async function shops(params) {
    return request(`${api.shops.url}?${stringify(params)}`)
}

// 新码列表
export async function qrcodes(params) {
    return request(`${api.qrcodes.url}?${stringify(params)}`)
}

// 获取活动详情
export function activitiesDetail(id) {
    return request(format(apiExamine.activitiesDetail.url, { id }))
}

// 活动下线
export async function downline(params) {
    return request(format(api.downline.url, { id: params.id }), {
        method: api.downline.type,
        body: params,
    })
}

// 删除活动
export async function remove(params) {
    return request(format(api.remove.url, { id: params.id }), {
        method: api.remove.type,
        body: params,
    })
}

// 活动统计
export function statistics(id) {
    return request(format(api.statistics.url, { id }))
}

//获取七牛上传文件token
export async function getToken(params) {
    return request(`${api.getToken.url}?${stringify(params)}`)
}

// 活动引流图片
export function qrcodesImg(id) {
    return request(format(api.qrcodesImg.url, { id }))
}

export async function update(params) {
    return request(format(api.update.url, { id: params.id }), {
        method: api.update.type,
        body: params,
    })
}

// 是否开通
export async function isOpen(params) {
    return request(`${api.isOpen.url}?${stringify(params)}`)
}

// 商品列表
export async function goods(params) {
    return request(`${api.goods.url}?${stringify(params)}`)
}

