/**
 **@Description: 店铺管理接口
 **@author: zs
 */

//封装的请求方法
import request from 'setting/utils/request'
//请求地址
import api from 'setting/common/api/shops'
import {stringify} from 'qs'
import Helper from 'utils/helper'

//获取店铺列表
export async function getShopList(params) {
    return request(`${api.getShopList.url}?${stringify(params)}`)
}

//获取权限店铺列表
export async function getShopListOauth(params) {
    return request(`${api.getShopListOauth.url}?${stringify(params)}`)
}

//获取上传图片token
export async function getToken(params) {
    return request(`${api.getToken.url}?${stringify(params)}`)
}

//创建店铺
export async function createShop(params){
    return request(`${api.createShop.url}`, {
        method: api.createShop.type,
        body: params,
    })
}

//修改门店信息
export async function editeShopStore(params){
    return request(`${api.editeShopStore.url}/${params.id}`, {
        method: api.editeShopStore.type,
        body: params,
    })
}

//小程序授权
export async function shopOauthXuan(params){
    return request(`${api.shopOauthXuan.url}`, {
        method: api.shopOauthXuan.type,
        body: params,
    })
}

//解除淘宝授权
export async function deleteOauthTao(params){
    return request(`${api.deleteOauthTao.url}/${params.id}/relieve_auth`, {
        method: api.deleteOauthTao.type,
        body: params,
    })
}

//解除虎赞小店授权
export async function deleteOauthXuan(params){
    return request(`${api.deleteOauthXuan.url}/${params.id}/unbind_mpa`, {
        method: api.deleteOauthXuan.type,
        body: params,
    })
}

//授权小程序列表
export async function oauthXuanList(params){
    return request(`${api.oauthXuanList.url}?${stringify(params)}`)
}

//淘宝店铺信息
export async function getOauthInfo(params){
    return request(`${api.getOauthInfo.url}/${params.id}`)
}

//店铺部门修改
export async function editeShopDepart(params){
    return request(`${api.editeShopDepart.url}/${params.id}/department`, {
        method: api.editeShopDepart.type,
        body: params,
    })
}

//淘宝授权
export async function getOauthUrl(params){
    return request(`${api.getOauthUrl.url}`, {
        method: api.getOauthUrl.type,
        body: params,
    })
}

//淘宝第二次授权
export async function shopOauthSucc(params){
    return request(`${api.shopOauthSucc.url}`, {
        method: api.shopOauthSucc.type,
        body: params,
    })
}

//京东授权
export async function getJdOauthUrl (params) {
    return request(`${api.getJdOauthUrl.url}?oauth_domain=${params.redirect_uri}`)
}

// 过期提醒
export async function getDueRemind(params) {
    return request(`${api.getDueRemind.url}`)
}

export async function postDueRemind(params) {
    return request(`${api.postDueRemind.url}`, {
        method: api.postDueRemind.type,
        body: params,
    })
}
export async function putDueRemind (params) {
    return request(`${api.putDueRemind.url}`, {
        method: api.putDueRemind.type,
        body: params,
    })
}

// 聚水潭授权
export async function getJstOauthUrl(params){
    return request(Helper.format(`${api.getJstOauthUrl.url}`), {
        method: api.getJstOauthUrl.type,
        body: params,   
    })
}

