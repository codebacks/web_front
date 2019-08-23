/**
 * 文件说明: 辅助工具
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 18/08/01
 */

import request from './request'
import constant from 'constant'

export {request}

export function getStorage() {
    if(window.localStorage) {
        return window.localStorage
    }
    return {}
}

export function getTokenForStorage() {
    const storage = getStorage()
    if(storage) {
        return storage.setItem(constant.accessTokenKey)
    }else {
        return false
    }
}

export function removeTokenForStorage() {
    const storage = getStorage()
    if(storage) {
        return storage.removeItem(constant.accessTokenKey)
    }else {
        return false
    }
}

export function setTokenForStorage(token) {
    const storage = getStorage()
    if(storage) {
        return storage.setItem(constant.accessTokenKey, token)
    }else {
        return false
    }
}
