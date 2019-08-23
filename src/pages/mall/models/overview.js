
import { getToken } from 'setting/services/shops'
import { getMerchantInfo, getTradeInfo, getQRCode, getStartEnd, getEchartsData, getMapStatus } from 'mall/services/overview'
import {procedure} from 'mall/services/initialization'
export default {
    namespace: 'home_overview',
    state: {
        photoToken: '',
        photoPrefix: '',
        shopName: '',
        logoUrl: '',
        shopDetail: {},
        mpa: {},
        //正式二维码
        QRcode: '',
        //体验二维码
        expQRcode: '',
        startEnd: {},
        stat_mpa: [],
        stat_goods: [],
        status: 0,
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
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
        *getMerchantInfo({payload, callback},{call, put}){
            const data = yield call(getMerchantInfo, payload)
            // console.log(data)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        shopName: data.name || '',
                        logoUrl: data.logo_url || '',
                        mpa: data.mpa || {},
                    },
                })
                callback && callback(data)
            }
        },
        *getMapStatus({payload, callback},{call, put}){
            const data = yield call(getMapStatus, payload)
            // console.log(data)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        status: data
                    },
                })
            }
        },
        *getTradeInfo({payload, callback},{call, put}){
            const data = yield call(getTradeInfo, payload)
            // console.log(data)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        shopDetail: data
                    },
                })
            }
        },
        *getQRCode({payload, callback},{call, put}){
            const data = yield call(getQRCode, payload)
            // console.log(data)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        QRcode: data.code_url || '',
                        expQRcode: data.exp_code_url || '',
                    },
                })
            }
        },
        *getStartEnd({payload, callback},{call, put}){
            const data = yield call(getStartEnd, payload)
            // console.log(data)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        startEnd: data
                    },
                })
                callback && callback(data)
            }
        },
        *getEchartsData({payload, callback},{call, put}){
            const data = yield call(getEchartsData, payload)
            // console.log(data)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        stat_mpa: data.stat_mpa || [],
                        stat_goods:  data.stat_goods || [],
                    },
                })
                callback && callback(data)
            }
        },
        * procedure({payload, callback}, {select, call, put}) {
            const {data} = yield call(procedure, payload)
            if(data) {
                if (data.shop && data.shop.length > 0) {
                    yield put({type: 'setProperty', payload: {shopInfo: data.shop&&data.shop[0], mpaId: data.mpaId?data.mpaId:{}}})
                }
                callback && callback(data)
            }
        },
    }
}