/**
 **@time: 2018/8/15
 **@Description:支付设置
 **@author: wangchunting
 */

import { payList, create, remove, update, getToken, getEditModel } from 'setting/services/pay'

export default {
    namespace: 'setting_pay',
    state: {
        roles: [],
        activeRole: null,
        payData: [],
        createPay: {},
        documentToken: '',
        documentPrefix: '',
        editModel: {}
    },
    effects: {
        * payList({ payload, callback }, { select, call, put }) {
            const data = yield call(payList, payload)
            if (data) {
                //将数据返回到页面上
                yield put({
                    type: 'setProperty',
                    payload: {
                        payData: data.data,
                    },
                })
            }
        },
        * create({ payload, callback }, { select, call, put }) {
            const { data } = yield call(create, payload.paies)
            if (data) {
                callback && callback()
            }
        },
        * remove({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(remove, payload)
            if (meta && meta.code === 200) {
                callback && callback()
            }
        },
        * update({ payload, callback }, { select, call, put }) {
            const { data } = yield call(update, payload.paies)
            if (data) {
                callback && callback()
            }
        },
        *getToken({ payload, callback }, { call, put }) {
            const data = yield call(getToken, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        documentToken: data.data.token,
                        documentPrefix: data.data.prefix,
                    },
                })
            }
        },
        * getEditModel({ payload, callback }, { select, call, put }) {
            const data = yield call(getEditModel, payload.id)
            yield put({
                type: 'setProperty',
                payload: {
                    editModel: data.data,
                },
            })

            callback && callback()
        },
    },

    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
        resetModel(state, action) {
            var model = {
                cert_p12_url: '',
                cert_pem_url: '',
                key_pem_url: '',
                key: '',
                secret: '',
            }
            return { ...state, editModel: model }
        }
        // setEditModel(state, action){
        //     var raw = action.payload
        //     var model = {
        //         ...raw,
        //         merchant: raw.merchant_key,

        //     }
        //     return {...state, editModel: model}
        // }
    },
}
