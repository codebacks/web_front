/*
 * @Author: sunlzhi 
 * @Date: 2018-10-10 14:10:58 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-10-19 14:28:22
 */

import {procedure, getToken, getWxMerchants, getMpas, updateShop, addShop, create} from 'mall/services/initialization'
export default {
    namespace: 'initialization',
    state: {
        mpaId: {},
        shopInfo: {},
        mpas: [],
        payConfigureList: [],
        WxMerchants: [],
        qiniuToken: '',
        qiniuPrefix: ''
    },
    effects: {
        * procedure({payload, callback}, {select, call, put}) {
            const {data} = yield call(procedure, payload)

            if(data) {
                if (data.shop && data.shop.length > 0) {
                    yield put({type: 'setProperty', payload: {shopInfo: data.shop&&data.shop[0], mpaId: data.mpaId?data.mpaId:{}}})
                }
                callback && callback(data)
            }
        },
        *getToken({ payload, callback }, { call, put }) {
            const data = yield call(getToken, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        qiniuToken: data.data.token,
                        qiniuPrefix: data.data.prefix,
                    },
                })
            }
        },
        // 创建支付配置
        * create({ payload, callback }, { select, call, put }) {
            const { data } = yield call(create, payload.paies)
            if (data) {
                callback && callback()
            }
        },
        *getWxMerchants({ payload, callback }, { call, put }) {
            const data = yield call(getWxMerchants, payload)
            if (data) {
                yield put({type: 'setProperty', payload: {WxMerchants: data.data}})
                callback && callback(data)
            }
        },
        *getMpas({payload, callback}, {select, call, put}) {
            const {data} = yield call(getMpas, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {mpas: data}})
                callback && callback(data)
            }
        },
        *addShop({payload, callback}, {select, call, put}) {
            const {data} = yield call(addShop, payload)

            if(data) {
                // yield put({type: 'setProperty', payload: {mpas: data}})
                callback && callback(data)
            }
        },
        *updateShop({payload, callback}, {select, call, put}) {
            const {data} = yield call(updateShop, payload)

            if(data) {
                // yield put({type: 'setProperty', payload: {mpas: data}})
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
