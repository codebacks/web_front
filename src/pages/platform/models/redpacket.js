/**
 **@Description:
 **@author: 吴明
 */

import {tableList, checkPacket,shopList,report,reportList} from 'platform/services/redpacket'

export default {
    namespace: 'platform_redpacket',
    state: {
        data:[],
        ispacket:'',
        count:'',
        loading:false,
        shopList:[],
        reportList:[],
        reportList_total:'',
    },

    effects: {
        // 获取红包列表
        *tableList({ payload ,callback}, { call, put }) {
            yield put({ type: 'queryList', payload: { loading: true }})
            const response = yield call(tableList, payload)
            if(response.data){
                yield put({
                    type: 'queryList',
                    payload: {
                        data:response.data,
                        count:response.pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({ type: 'queryList', payload: { loading: false }})
        },
        // 是否开通小红包功能
        *checkPacket({payload,callback},{call, put }) {
            const response = yield call (checkPacket,payload)
            if(response.data){
                yield put({
                    type: 'setCheckPacket',
                    payload: {
                        ispacket:response.data
                    }
                })
                callback && callback()
            }
        },
        // 店铺列表
        *shopList({payload, callback},{call, put}){
            const response = yield call (shopList,payload)
            if(response.data){
                yield put({
                    type: 'setShopList',
                    payload: {
                        shopList:response.data
                    }
                })
                callback && callback()
            }
        },
        *report({payload, callback},{call, put}){
            const response = yield call (report,payload)
            callback && callback(response)
        },
        *reportList({payload, callback},{call, put}){
            const response = yield call (reportList,payload)
            if(response.data){
                yield put({
                    type: 'setShopList',
                    payload: {
                        reportList:response.data.filter(v => v.attach = JSON.parse(v.attach)),
                        reportList_total:response.pagination.rows_found
                    }
                })
            }
            callback && callback(response)
        },
    },

    reducers: {
        setCheckPacket(state, action) {
            return {
                ...state,
                ...action.payload
            }
        },
        queryList(state,action) {
            return {
                ...state,
                ...action.payload
            }
        },
        setShopList(state,action) {
            return {
                ...state,
                ...action.payload
            }
        }
    },
}
