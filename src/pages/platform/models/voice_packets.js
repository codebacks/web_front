/**
 **@Description:
 **@author: 吴明
 */

import {voicePacketsList,
    voicePacketsAccount,
    openAccount,
    shopList,
    rechargeList,
    settlements,
    settlementsList,
    downloadBill,
    downloadDetail,
    recharge,
    rechargeStatus,
    checkFirstRecharge} from '../services/voice_packets'

export default {
    namespace: 'platform_voicepacket',
    state: {
        data:[],
        ispacket:'',
        count:'',
        loading:false,
        shopList:[],
        isOpenAccount:undefined,
        accountInfo:'',
        rate:0,
        rechargeList:[],
        total:0,
        reconciliationData:[],
        expendMoney:0,
        expendCount:0,
        checkFirstRecharge:''
    },

    effects: {
        *voicePacketsList({ payload ,callback}, { call, put }) {
            yield put({ type: 'setProperty', payload: { loading: true }})
            const response = yield call(voicePacketsList, payload)
            if(response.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        data:response.data,
                        count:response.pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({ type: 'setProperty', payload: { loading: false }})
        },
        *voicePacketsAccount({payload,callback},{call, put }) {
            const response = yield call (voicePacketsAccount,payload)
            if(response.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        accountInfo:response.data,
                        isOpenAccount:true,
                        rate:response.data.rate/1000
                    }
                })
                callback && callback(true)
            }else{
                yield put({
                    type: 'setProperty',
                    payload: {
                        isOpenAccount:false
                    }
                })
                callback && callback(false)
            }
        },
        *openAccount({payload, callback},{call, put}){
            const response = yield call (openAccount,payload)
            if(response.data){
                callback && callback()
            }
        },
        *checkFirstRecharge({payload, callback},{call, put}){
            const {data} = yield call (checkFirstRecharge,payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        checkFirstRecharge:data.is_first_charge
                    }
                })
                callback&&callback(data.is_first_charge)
            }
        },
        *rechargeStatus({payload, callback},{call, put}){
            const response = yield call (rechargeStatus,payload)
            if(response.data){
                callback && callback(response.data)
            }
        },
        *rechargeList({payload, callback},{call, put}){
            yield put({ type: 'setProperty', payload: { loading: true }})
            const response = yield call (rechargeList,payload)
            if(response.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        rechargeList:response.data,
                        count:response.pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({ type: 'setProperty', payload: { loading: false }})
        },
        *recharge({payload, callback},{call, put}){
            const response = yield call (recharge,payload)
            if(response.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                    }
                })
                callback && callback(response.data)
            }
        },
        // 店铺列表
        *shopList({payload, callback},{call, put}){
            const response = yield call (shopList,payload)
            if(response.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        shopList:response.data
                    }
                })
                callback && callback()
            }
        },
        *settlements({payload, callback},{call, put}){
            const response = yield call (settlements,payload)
            if(response.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        expendMoney:response.data.total_amount,
                        expendCount:response.data.total_count
                    }
                })
                callback && callback()
            }
        },
        *settlementsList({payload, callback},{call, put}){
            yield put({ type: 'setProperty', payload: { loading: true }})
            const response = yield call (settlementsList,payload)
            if(response.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        reconciliationData:response.data,
                        total:response.pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({ type: 'setProperty', payload: { loading: false }})
        },
        *downloadBill({payload, callback},{call, put}){
            const response = yield call (downloadBill,payload)
            if(response.data){
                callback && callback(response.data)
            }
        },
        *downloadDetail({payload, callback},{call, put}){
            const response = yield call (downloadDetail,payload)
            if(response.data){
                callback && callback(response.data)
            }
        },
    },

    reducers: {
        setProperty(state,action) {
            return {
                ...state,
                ...action.payload
            }
        },
    },
}
