import router from 'umi/router'
import {login, logout} from 'services/login'
import {inviteInfo} from 'services/register'
import {captcha} from 'services/sms'
import {check} from 'services/captcha'
import _ from 'lodash'
import {globalActionsType} from 'utils/dva'
import {removeSSOToken, setSSOToken, adminToken, useToken} from 'utils/SSO'

export default {
    namespace: 'login',

    state: {},

    effects: {
        * check({payload, callback}, {select, call, put}) {
            const {meta, data} = yield call(check, payload)

            if (meta && meta.code === 200 && data) {
                callback && callback(data)
            }
        },
        * captcha({payload, callback}, {select, call, put}) {
            const {meta, data} = yield call(captcha, payload)

            if (meta && meta.code === 200 && data) {
                callback && callback(data)
            }
        },
        * inviteInfo({payload, callback}, {select, call, put}) {
            const {data} = yield call(inviteInfo, payload)

            if (data) {
                callback && callback(data)
            }
        },
        * login({payload, callback}, {call, put, select}) {
            const oemConfig = yield select(({oem}) => {
                return oem.oemConfig
            })

            const option = Object.assign({}, payload, {
                channel: oemConfig.channel,
            })

            const {meta, data, error} = yield call(login, option)

            if (meta && meta.code === 200 && data) {
                const query = yield select(state => {
                    return state.routing.location.query
                })

                yield put({
                    type: 'base/setAccessToken',
                    payload: {
                        accessToken: data.access_token,
                    },
                })

                setSSOToken(useToken, data.access_token)
                setSSOToken(adminToken, data.access_token)

                callback && callback(meta, data)

                if (query.redirect_url) {
                    let url = query.redirect_url
                    if (query.access_token === '1') {
                        url += `?access_token=${data.access_token}`
                    }

                    window.location = url
                }else {

                    router.replace('/')
                }
            }else if (meta && meta.code === 1024) {
                callback && callback(meta, data)
            }else if (error) {
                const responseJson = _.get(error, 'responseJson')
                callback && callback(responseJson.meta, responseJson.data, error)
            }
        },
        * logout({payload}, {call, put, select}) {
            try {
                const accessToken = yield select(state => {
                    return state.base.accessToken
                })

                if (accessToken) {
                    yield call(logout, payload)
                    // const {meta} = yield call(logout, payload)
                }

                yield put({
                    type: 'base/setProperty',
                    payload: {
                        tree: [],
                        flatTree: null,
                    },
                })

                window.sessionStorage.clear()

                router.replace('/login')
            } catch (e) {
            } finally {
                yield put({
                    type: globalActionsType.logout,
                })
                window.localStorage && window.localStorage.removeItem('isQIDIAN')
                removeSSOToken(useToken)
                removeSSOToken(adminToken)

                yield put({
                    type: 'base/removeAccessToken',
                })
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
