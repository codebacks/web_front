/**
 **@Description:
 **@author: 吴明
 */

import {accountList,getSeventIncome,accountDetailList,accountDetail} from 'mall/services/account'

export default {
    namespace: 'mall_account',
    state: {
        count:'',
        loading:false,
        sevenIncome:0,
        monthIncome:0,
        accountList:[],
        accountDetailList:[],
        amount:0,
        time:''
    },

    effects: {
        // 获取账户列表
        *accountList({ payload ,callback}, { call, put }) {
            yield put({ type: 'queryList', payload: { loading: true }})
            const response = yield call(accountList, payload)
            let count = response.headers.get('row_count')
            const json = yield  response.json()
            if(response){
                yield put({
                    type: 'queryList',
                    payload: {
                        accountList:json,
                        count:Number(count)
                    }
                })
                callback && callback()
            }
            yield put({ type: 'queryList', payload: { loading: false }})
        },
        // 近7日收入
        *sevenIncome({ payload ,callback}, { call, put }) {
            const response = yield call(getSeventIncome, payload)
            if(response){
                yield put({
                    type: 'queryList',
                    payload: {
                        sevenIncome:response.week_income,
                        monthIncome:response.total_income
                    }
                })
                callback && callback()
            }
        },
        *accountDetailList({ payload ,callback}, { call, put }) {
            yield put({ type: 'queryList', payload: { loading: true }})
            const response = yield call(accountDetailList, payload)
            let count = response.headers.get('row_count')
            const json = yield  response.json()
            if(response){
                yield put({
                    type: 'queryList',
                    payload: {
                        accountDetailList:json,
                        count:Number(count)
                    }
                })
                callback && callback()
            }
            yield put({ type: 'queryList', payload: { loading: false }})
        },
        *accountDetail({ payload ,callback}, { call, put }) {
            const response = yield call(accountDetail, payload)
            if(response){
                yield put({
                    type: 'queryList',
                    payload: {
                        amount:response.amount,
                        time:response.end_at
                    }
                })
                callback && callback()
            }
        },

    },

    reducers: {
        queryList(state,action) {
            return {
                ...state,
                ...action.payload
            }
        },
    },
}
