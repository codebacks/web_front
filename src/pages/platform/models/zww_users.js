/*
 * @Author: sunlizhi 
 * @Date: 2018-11-30 16:57:52 
 * @Last Modified by: sunlizhi
 * @Last Modified time: 2018-12-06 15:35:37
 */

import { getUserManagementList, accountRecord, sentRecords, consumeRecords } from 'platform/services/zww_users'

export default {
    namespace: 'zww_users',
    state: {
        userManagementList: [],
        count: 0,
        accountRecord: {},
        sentRecordsList: [],
        sentRecordsCount: 0,
        consumeRecordsList: [],
        consumeRecordsCount: 0,
    },

    effects: {
        // 获取账户管理列表
        *getUserManagementList({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(getUserManagementList, payload)
            if (data) {
                yield put({type: 'setProperty', payload: {userManagementList: data, count: pagination.rows_found}})
                callback && callback()
            }
        },
        *accountRecord({ payload, callback }, { select, call, put }) {
            const { data } = yield call(accountRecord, payload)
            if (data) {
                yield put({type: 'setProperty', payload: {accountRecord: data}})
                callback && callback()
            }
        },
        *sentRecords({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(sentRecords, payload)
            if (data) {
                yield put({type: 'setProperty', payload: {sentRecordsList: data, sentRecordsCount: pagination.rows_found}})
                callback && callback()
            }
        },
        *consumeRecords({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(consumeRecords, payload)
            if (data) {
                yield put({type: 'setProperty', payload: {consumeRecordsList: data, consumeRecordsCount: pagination.rows_found}})
                callback && callback()
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    }, 
}