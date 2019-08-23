/**
 **@Description:
 **@author: leo
 */

import {updateMe, updatePassword, verifyMe, changeMobile} from 'services/users'
import {sentSms} from 'services/sms'

export default {
    namespace: 'setting_personalInformation',

    state: {},

    effects: {
        * verifyMe({payload, callback}, {select, call, put}) {
            const {data} = yield call(verifyMe, payload)

            if(data) {
                callback && callback(data)
            }
        },
        * changeMobile({payload, callback}, {select, call, put}) {
            const {data} = yield call(changeMobile, payload)

            if(data) {
                callback && callback()
            }
        },
        * updateMe({payload, callback}, {select, call, put}) {
            const {data} = yield call(updateMe, payload)

            if(data) {
                callback && callback()
            }
        },
        * updatePassword({payload, callback}, {select, call, put}) {
            const {data} = yield call(updatePassword, payload)

            if(data) {
                callback && callback()
            }
        },
        * sentSms({payload, callback}, {select, call, put}) {
            const {meta} = yield call(sentSms, payload)

            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
