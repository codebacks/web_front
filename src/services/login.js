import request from 'utils/request'
import api from 'common/api/login'

export async function login(params) {
    return request(api.login.url, {
        method: api.login.type,
        body: params,
    },{
        isShowErrorText: false
    })
}

export async function logout(params) {
    return request(api.logout.url, {
        method: api.logout.type,
        body: params,
    })
}

