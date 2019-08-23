/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/4/4
 */
import Cookies from 'utils/cookie'

const domain = '51zan.com'
export const useToken = 'HuZanUserToken'
export const adminToken = 'HuZanAdminToken'

function getTokenName(name) {
    return `${HUZAN_ENV}_${name}`
}

export function getSSOToken(name) {
    return Cookies.get(getTokenName(name), {domain})
}

export function setSSOToken(name, token) {
    try {
        Cookies.set(getTokenName(name), token, {domain, expires: 365, secure: true})
    }catch (e) {
        console.error(e)
    }
}

export function removeSSOToken(name) {
    Cookies.remove(getTokenName(name), {domain})
}

