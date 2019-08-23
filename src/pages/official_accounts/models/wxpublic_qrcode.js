
import { listData } from 'platform/services/blueprint'
import { getToken } from 'setting/services/shops'
import { subData } from 'setting/services/subscription'

import {qrcodeList,qrcodeDetail,postQrcode,putQrcode,deleteQrcode,recordQrcode} from '../services/wxpublic_qrcode'

export default {
    namespace: 'wxpublic_qrcode',
    state: {
        list: [],
        detail: {},
        photoToken: '',
        photoPrefix: '',
        total: 0,
        activityList:[],
        recordQrcodeList: [],
        recordQrcodeTotal: 0
    },
    effects: {
        *getToken({payload, callback},{call, put}){
            const data = yield call(getToken, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        photoToken: data.data.token,
                        photoPrefix: data.data.prefix,
                    },
                })
            }
        },
        * activityList({ payload, callback }, { select, call, put }) {
            const { data } = yield call(listData, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        activityList: data.data
                    },
                })
            }
            callback && callback(data)
        },
        * subData({payload, callback}, {select, call, put}) {
            const {data} = yield call(subData, payload)

            if(data) {
                // yield put({type: 'setProperty', payload: {subData: data}})
                callback && callback(data)
            }
        },
        *qrcodeList({ payload, callback }, { select, call, put }) {
            const respones = yield call(qrcodeList, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: respones.data,
                        total:respones.pagination && respones.pagination.row_count
                    }
                })
                callback && callback()
            }
        },
        *recordQrcode({ payload, callback }, { select, call, put }) {
            const respones = yield call(recordQrcode, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        recordQrcodeList: respones.data,
                        recordQrcodeTotal:respones.pagination && respones.pagination.rows_found
                    }
                })
                callback && callback()
            }
        },
        *qrcodeDetail({ payload, callback }, { select, call, put }) {
            const respones = yield call(qrcodeDetail, payload)
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
        *postQrcode({ payload, callback }, { select, call, put }) {
            const respones = yield call(postQrcode, payload)
            if (respones) {
                callback && callback(respones)
            }
        },
        *putQrcode({ payload, callback }, { select, call, put }) {
            const respones = yield call(putQrcode, payload)
            if (respones) {
                callback && callback(respones)
            }
        },
        *deleteQrcode({ payload, callback }, { select, call, put }) {
            const respones = yield call(deleteQrcode, payload)
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
        }
        
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
