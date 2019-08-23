import router from 'umi/router'

import _ from 'lodash'

import { registerSmsCode , registerCampany, registerEnterprise,registerEnterpriseBind, getCaptcha } from '../services/register'

export default {
    namespace: 'register',

    state: {},

    effects: {
        *getCaptcha({payload, callback}, {call, put, select}) {
            const data = yield call(getCaptcha, payload)
            if(data.meta.code == 200) {
                callback && callback(data)
            }
        },
        *registerSmsCode({payload, callback}, {call, put, select}) {
            const data = yield call(registerSmsCode, payload)
            if(data.meta.code == 200) {
                callback && callback()
            }
        },
        *registerCampany({payload,callback}, {call, put, select}) {
            const oemConfig = yield select(({oem}) => {
                return oem.oemConfig
            })

            const option = Object.assign({}, payload, {
                channel: oemConfig.channel,
            })

            const data = yield call(registerCampany, option)
            if(data.meta.code === 200) {
                callback && callback()
            }
        },
        *registerEnterprise({payload,callback}, {call, put, select}) {
            const data = yield call(registerEnterprise, payload)
            callback && callback(data)
        },
        *registerEnterpriseBind({payload,callback}, {call, put, select}) {
            const data = yield call(registerEnterpriseBind, payload)
            callback && callback(data)
        }
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    }
}
