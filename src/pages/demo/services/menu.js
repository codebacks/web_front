/**
 * 文件说明: 菜单
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 18/08/01
 */

import { stringify } from 'qs'
import request from 'demo/utils/request'
import API from '../common/api/menu'

export async function query(params) {
    return request(`${API.list.url}?${stringify(params)}`)
}

export async function create(body) {
    return request(API.create.url, {
        method: API.create.type,
        body: body,
    })
}

