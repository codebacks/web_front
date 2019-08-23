import request from './request'
import config from 'config'
import pathToRegexp from 'path-to-regexp'
import {Form} from "antd"

export {request}

export function safeJsonParse(data = '', errorRe = {}) {
    try {
        return JSON.parse(data)
    }catch(e) {
        console.log(e)
        return errorRe
    }
}

export function safeJsonStringify(data = {}, errorRe = '') {
    try {
        return JSON.stringify(data)
    }catch(e) {
        console.log(e)
        return errorRe
    }
}

export function matchGlobalPagePaths(pathname) {
    return config.globalPagePaths.some((item) => {
        return checkPath(item, pathname)
    })
}

export function isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

export function matchIgnoreCheckPagesPermissionPaths(pathname) {
    return config.ignoreCheckPagesPermissionPaths.some((item) => {
        return checkPath(item, pathname)
    })
}

export function checkPathList(item, pathnameList) {
    return pathnameList.find((pathname) => {
        return checkPath(item, pathname)
    })
}

export function checkPath(item, pathname) {
    return pathToRegexp(item).test(pathname)
}

export function treeForEach(treeData, cb, parent) {
    treeData.forEach((data) => {
        cb(data, parent)
        if(data.children) {
            treeForEach(data.children, cb, data)
        }
    })
}

export function forEachAntdFormFields(form, cb = (key, value, form) => {
    form[key] = Form.createFormField(value)
}) {
    Object.keys(form).forEach((key) => {
        if(typeof cb === 'function') {
            cb(key, form[key], form)
        }
    })
    return form
}

export function getStorage() {
    if(window.localStorage) {
        return window.localStorage
    }
    return {}
}

export function localStorageFn(method, args, returnErrorVal = '') {
    try {
        return window.localStorage[method](...args)
    }catch(e) {
        return returnErrorVal
    }
}

export function getTokenForStorage() {
    const storage = getStorage()
    if(storage) {
        return storage.getItem(config.accessTokenKey)
    }else {
        return false
    }
}

export function hasTokenForStorage() {
    const token = getTokenForStorage()

    return !!token
}

export function removeTokenForStorage() {
    const storage = getStorage()
    if(storage) {
        return storage.removeItem(config.accessTokenKey)
    }else {
        return false
    }
}

export function setTokenForStorage(token) {
    const storage = getStorage()
    if(storage) {
        return storage.setItem(config.accessTokenKey, token)
    }else {
        return false
    }
}

export function winOpen(url) {
    try {
        const otherWindow = window.open()
        otherWindow.opener = null
        otherWindow.location = url
    }catch(e) {
        window.open(url)
    }
}

export const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/

export function isUrl(path) {
    return reg.test(path)
}

export function urlToList(url) {
    const urllist = url.split('/').filter(i => i)
    return urllist.map((urlItem, index) => {
        return `/${urllist.slice(0, index + 1).join('/')}`
    })
}

export function format(str, obj) {
    if(!obj) {
        return str
    }
    return str.replace(/\{([^}]+)\}/g, (match, key) => obj[key])
}
