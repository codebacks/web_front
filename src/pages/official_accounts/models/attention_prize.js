


import { subData } from 'setting/services/subscription'

import {
    attentionPrizeList,
    postAttentionPrize,
    putAttentionPrize,
    deleteAttentionPrize,
    recordAttentionPrize,
    attentionPrizeDetail,
    createQrcode
} from '../services/attention_prize'

export default {
    namespace: 'attention_prize',
    state: {
        list: [],
        detail: {},
        total: 0,
        recordAttentionPrize: {},
    },
    effects: {
        * subData({payload, callback}, {select, call, put}) {
            const {data} = yield call(subData, payload)
            if(data) {
                callback && callback(data)
            }
        },
        *attentionPrizeList({ payload, callback }, { select, call, put }) {
            const {data,pagination} = yield call(attentionPrizeList, payload)
            if (data && pagination) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list:data,
                        total:pagination.rows_found
                    }
                })
                callback && callback()
            }
        },
        *recordAttentionPrize({ payload, callback }, { select, call, put }) {
            const respones = yield call(recordAttentionPrize, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        recordAttentionPrize: respones.data
                    }
                })
                callback && callback(respones.data)
            }
        },
        *attentionPrizeDetail({ payload, callback }, { select, call, put }) {
            const respones = yield call(attentionPrizeDetail, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detail: respones.data
                    }
                })
                callback && callback()
            }
        },
        *postAttentionPrize({ payload, callback }, { select, call, put }) {
            const respones = yield call(postAttentionPrize, payload)
            if (respones) {
                callback && callback(respones)
            }
        },
        *putAttentionPrize({ payload, callback }, { select, call, put }) {
            const respones = yield call(putAttentionPrize, payload)
            if (respones) {
                callback && callback(respones)
            }
        },
        *deleteAttentionPrize({ payload, callback }, { select, call, put }) {
            const respones = yield call(deleteAttentionPrize, payload)
            if (respones && respones.data) {
                callback && callback(respones.data)
            }
        },
        *clearProperty({ payload, callback }, { select, call, put }){
            yield put({
                type: 'setProperty',
                payload: {
                    detail: {}
                }
            })
        },
        *createQrcode({ payload, callback }, { select, call, put }){
            const respones = yield call(createQrcode, payload)
            yield put({
                type: 'setProperty',
                payload: {
                    detail: {}
                },
                callback:()=>{}
            })
        }
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
