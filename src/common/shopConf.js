/**
 *  店铺类型
 * 
 *  平台类型
 * 
 *  授权来源
 * 
 *  授权状态
 * 
 *  店铺类型 >< 平台类型
 * 
 *  店铺类型 >< 用户来源
 * 
 */

import _ from 'lodash'
const getListItem =(data, val, getProps, returnProps) => { 
    const obj = _.find(data , c => c[getProps] === val)
    return obj && obj[returnProps]
}

/**
 * 店铺类型枚举
 * type 和 text 都为显示文本，type是原来的老名称
 */
export const SHOP_TYPE_ENUM = {
    TaoBaoTianMao: { value: 2, text: '淘宝/天猫', type: '淘宝/天猫', name: 'TaoBaoTianMao' },
    TaoBao:        { value: 2, text: '淘宝', type: '淘宝', name: 'TaoBao' },
    TianMao:       { value: 3, text: '天猫', type: '天猫', name: 'TianMao' },
    HuZan:         { value: 1, text: '虎赞小店', type: '虎赞小店', name: 'HuZan' },
    Mendian:       { value: 4, text: '门店', type: '门店', name: 'Mendian' },
    JD:            { value: 5, text: '京东', type: '京东', name: 'JD' },
    YouZan:        { value: 6, text: '有赞', type: '有赞', name: 'YouZan' },
    ZiYing:        { value: 7, text: '自营', type: '自营', name: 'ZiYing' },
    WS:            { value: 9, text: '微商小店', type: '微商小店', name: 'WS' },

}

/**
 * 店铺类型
 */
export const SHOP_TYPE = [
    SHOP_TYPE_ENUM.TaoBao,
    SHOP_TYPE_ENUM.TianMao,
    SHOP_TYPE_ENUM.HuZan,
    SHOP_TYPE_ENUM.Mendian,
    SHOP_TYPE_ENUM.JD,
    SHOP_TYPE_ENUM.YouZan,
    SHOP_TYPE_ENUM.ZiYing,
    SHOP_TYPE_ENUM.WS,
] 

export const SHOP_TYPE_BLUEPRINT = [
    SHOP_TYPE_ENUM.TaoBaoTianMao,
    SHOP_TYPE_ENUM.HuZan,
    // SHOP_TYPE_ENUM.Mendian,
    SHOP_TYPE_ENUM.JD,
    SHOP_TYPE_ENUM.YouZan,
    SHOP_TYPE_ENUM.ZiYing,
    SHOP_TYPE_ENUM.WS,
] 

/**
 * 根据店铺name获取店铺类型的值
 * @param {string} name 店铺的name
 * @returns
 */
export function getShopValByName(name){
    return getListItem(SHOP_TYPE, name, 'name', 'value')
}

/**
 * 根据店铺的值获取店铺类型显示文本
 * @param {number} value 店铺的值
 * @returns 
 */
function getShopTypeByVal(value){
    const v = _.toInteger(value)
    return getListItem(SHOP_TYPE, v, 'value', 'type')
}

function getShopBluePrintTypeByVal(value){
    const v = _.toInteger(value)
    return getListItem(SHOP_TYPE_BLUEPRINT, v, 'value', 'type')
}

/**
 * 根据店铺的值获取店铺类型
 * @param {number} value 店铺的值
 */
export function getShopType(value) {
    return _.find(SHOP_TYPE, item => item.value === value)
}

// 平台类型
export const PLATFORM_TYPE = [
    { value: 1, type: '淘宝/天猫', name: 'TaoBao'},
    { value: 2, type: '京东', name: 'JD' },
    { value: 20, type: '有赞', name: 'YouZan' },
    { value: 21, type: '虎赞小店', name: 'HuZan' },
    { value: 22, type: '微商小店', name: 'WS' },
    { value: 99, type: '自营', name: 'ZiYing' }
]
export function getPlatformTypeByVal(val){
    const v = _.toInteger(val)
    return getListItem(PLATFORM_TYPE, v, 'value', 'type')
}

// [platform]店铺类型，与平台类型、用户来源的对应关系
// [data_from]用户来源，1导入、2淘宝/天猫、23虎赞小店，后续的值通过订单的platform_type+2来算
export const DATA_MAPPING = [
    { type: 1, platform: 21, data_from: 23, name: 'HuZan', dec: '虎赞小店'},
    { type: 2, platform: 1, data_from: 2, name: 'TaoBao', dec: '淘宝天猫'},
    { type: 3, platform: 1, data_from: 2, name: 'TianMao', dec: '淘宝天猫'},
    { type: 4, platform: '', data_from: '', name: 'Mendian', dec: '门店'},
    { type: 5, platform: 2, data_from: 4, name: 'JD', dec: '京东'},
    { type: 6, platform: 20, data_from: 22, name: 'YouZan', dec: '有赞'},
    { type: 7, platform: 99, data_from: 101, name: 'ZiYing', dec: '自营'},
    { type: 9, platform: 22, data_from: 24, name: 'WS', dec: '微商小店'}
]

export function getMappingPlatformByType(val){
    const v = _.toInteger(val)
    return getListItem(DATA_MAPPING, v, 'type', 'platform')
}
export function getMappingFromByType(val){
    const v = _.toInteger(val)
    return getListItem(DATA_MAPPING, v, 'type', 'data_from')
}
export function getMappingDecByOri(val){
    const v = _.toInteger(val)
    return getListItem(DATA_MAPPING, v, 'data_from', 'dec')
}

export function getMappingDecByType(val){
    const v = _.toInteger(val)
    return getListItem(DATA_MAPPING, v, 'type', 'dec')
}
// 授权来源
export const AUTH_SOURCE = [
    { value: 1, type: '淘宝', name: 'TaoBao' },
    { value: 2, type: '京东', name: 'JD' },
    { value: 3, type: '聚水潭', name: 'Jst' },
    { value: 4, type: '有赞', name: 'YouZan' },
    { value: 5, type: '自营', name: 'ZiYing' },
]
export function getSourceTypeByVal(val){
    const v = _.toInteger(val)
    return getListItem(AUTH_SOURCE, v, 'value', 'type')
}
export function getSourceValByName(val){
    return getListItem(AUTH_SOURCE, val, 'name', 'value')
}

// 授权状态
export const OAUTH_STATE = [
    { value: 1, type: '未授权', name: 'Unauthorized' },
    { value: 2, type: '已授权', name: 'Authorized' },
    { value: 3, type: '已到期', name: 'Expired' },
    { value: 4, type: '授权终止', name: 'ErrAuthor' },
]
export function getOauthTypeByVal(val){
    const v = _.toInteger(val)
    return getListItem(OAUTH_STATE, v, 'value', 'type')
}
export function getOauthValByName(val){
    return getListItem(OAUTH_STATE, val, 'name', 'value')
}


// 支付方式
export const PAY_TYPE = [
    {value: 1,type: '货到付款'},
    {value: 2,type: '邮局汇款'},
    {value: 3,type: '现金自提'},
    {value: 4,type: '在线支付'},
    {value: 5,type: '公司转账'},
    {value: 6,type: '银行卡转账'},
    {value: 7,type: '微信'},
    {value: 8,type: '支付宝'},
    {value: 9,type: '其他'},
]
export function getPayTypeByVal(val){
    const v = _.toInteger(val)
    return getListItem(PAY_TYPE, v, 'value', 'type')
}


// 授权类型，按年授权按月授权
export const OAUTH_TYPE = {
    'OauthByYear': 'year',//按年授权
    'OauthByMonth': 'month',//按月授权
}

// 店铺授权回调地址
const PROTOCOL = window.location.protocol
const HOST = window.location.host
export const REDIRECT_URL = `${PROTOCOL}//${HOST}/setting/oauth_result`

export {
    getShopTypeByVal,
    getShopTypeByVal as getShopTypeTextByValue,
    getShopBluePrintTypeByVal,
}
