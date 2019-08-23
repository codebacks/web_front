/*
 * @Author: sunlzhi 
 * @Date: 2018-08-15 11:52:19 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-08-29 16:26:39
 */

import {subData, addSubConfigure, payConfigure, putSubConfigure, qiniuToken, getSubLink, getSubAuthInfo, subUnbind} from 'setting/services/subscription'

export default {
    namespace: 'setting_subscription', 

    state: {
        subData: [],
        addSubConfigureKey: '',
        payConfigureList: [],
        qiniuToken: {}
    },

    effects: {
        * subData({payload, callback}, {select, call, put}) {
            const {data} = yield call(subData, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {subData: data}})
                callback && callback(data)
            }
        },
        * addSubConfigure({payload, callback}, {select, call, put}) {
            const {data} = yield call(addSubConfigure, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {addSubConfigureKey: data.txtPath}})
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
        * qiniuToken({payload, callback}, {select, call, put}) {
            const {data} = yield call(qiniuToken, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {qiniuToken: data}})
            }
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
        * subUnbind({payload, callback}, {select, call, put}) {
            const {data} = yield call(subUnbind, payload)

            if(data) {
                callback && callback(data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        deleteSub(state, action) {
            for (let [i, v] of state.subData.entries()) {
                if (v.app_id === action.payload.app_id) {
                    state.subData.splice(i, 1)
                    break
                }
            }
            return {...state}
        }
    },
}
