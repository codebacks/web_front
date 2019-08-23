/**
 **@Description:
 **@author: leo
 */

import {sentSms, captcha} from 'services/sms'
import {findPassword} from 'services/users'

export default {
    namespace: 'base_findPassword',

    state: {
        captcha: {
            src: '',
        }
    },

    effects: {
        * findPassword({payload, callback}, {select, call, put}) {
            const {meta} = yield call(findPassword, payload)

            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * sentSms({payload, callback}, {select, call, put}) {
            const {meta} = yield call(sentSms, payload)

            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * captcha({payload, callback}, {select, call, put}) {
            const {meta, data} = yield call(captcha, payload)

            if(meta && meta.code === 200 && data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        captcha: data,
                    },
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
