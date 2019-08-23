/**
 **@Description:
 **@author: leo
 */

import {tableList} from 'platform/services'


export default {
    namespace: 'platform_base',

    state: {
        menuData: [],
        data:{}
    },

    effects: {
        *tableList({ payload ,callback}, { call, put }) {
            const response = yield call(tableList, payload)
            yield put({
                type: 'queryList',
                payload: response
            })
            callback && callback()
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        queryList(state,action) {
            return {
                ...state,
                data: action.payload
            }
        }
    },
}
