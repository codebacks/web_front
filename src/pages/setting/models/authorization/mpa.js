/*
 * @Author: sunlzhi 
 * @Date: 2018-08-15 11:52:19 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-10-12 16:57:04
 */

import {getMpas, payConfigure, putSubConfigure, getSubLink, getSubAuthInfo, mpaUnbind} from 'setting/services/mpa'
export default {
    namespace: 'setting_mpa', 

    state: {
        mpas: [],
        payConfigureList: [],
        qiniuToken: {}
    },

    effects: {
        * getMpas({payload, callback}, {select, call, put}) {
            const {data} = yield call(getMpas, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {mpas: data}})
                callback && callback(data)
            }
        },
        * payConfigure({payload, callback}, {select, call, put}) {
            const {data} = yield call(payConfigure, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {payConfigureList: data}})
            }
            callback && callback(data)
        },
        * putSubConfigure({payload, callback}, {select, call, put}) {
            const {data} = yield call(putSubConfigure, payload)
            const {meta} = yield call(putSubConfigure, payload)

            callback && callback(data, meta)
            if(data) {
            }
        },
        * getSubLink({payload, callback}, {select, call, put}) {
            const {data} = yield call(getSubLink, payload)

            if(data) {
                callback && callback(data)
            }
        },
        * getSubAuthInfo({payload, callback}, {select, call, put}) {
            const {data} = yield call(getSubAuthInfo, payload)

            if(data) {
                callback && callback(data)
            }
        },
        * mpaUnbind({payload, callback}, {select, call, put}) {
            const {data} = yield call(mpaUnbind, payload)

            if(data) {
                callback && callback(data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        deleteMpa(state, action) {
            for (let [i, v] of state.mpas.entries()) {
                if (v.app_id === action.payload.app_id) {
                    state.mpas.splice(i, 1)
                    break
                }
            }
            return {...state}
        }
    },
}
