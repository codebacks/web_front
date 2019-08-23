/**
 **@Description:
 **@author: 吴明
 */

import {accountLimitList,editAccountLimit,roles} from 'platform/services/packet_limit'

export default {
    namespace: 'platform_packet_limit',
    state: {
        data:[],
        ispacket:'',
        count:'',
        loading:false,
        shopList:[],
        stationList:[]
    },

    effects: {
        // 获取岗位列表
        *roles({ payload ,callback}, { call, put }) {
            const response = yield call(roles, payload)
            if(response.data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        stationList:response.data
                    }
                })
                callback && callback()
            }
        },
        // 获取账号限额列表
        *accountLimitList({ payload ,callback}, { call, put }) {
            yield put({ type: 'setProperty', payload: { loading: true }})
            const response = yield call(accountLimitList, payload)
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
        // 编辑账号限额
        *editAccountLimit({ payload ,callback}, { call, put }) {
            const response = yield call(editAccountLimit, payload)
            if(response.meta.code === 200){
                callback && callback()
            }
        }
    },

    reducers: {
        setProperty(state, action) {
            return {
                ...state,
                ...action.payload
            }
        }
    },
}
