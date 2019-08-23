/**
 **@Description:
 **@author: leo
 */

import {update} from 'setting/services/company'

export default {
    namespace: 'setting_companyInformation',

    state: {},

    effects: {
        * update({payload, callback}, {select, call, put}) {
            const {data} = yield call(update, payload)

            if(data) {
                callback && callback(data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
