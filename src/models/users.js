import {parse} from 'qs'
import {querySub, querySummary} from "services/users"

export default {
    namespace: 'users',
    state: {
        list: [],
        subUsers: [],
        loading: false,
        params: {
            department_id: '',
        },
    },
    subscriptions: {},
    effects: {
        * querySub({payload, callback}, {select, call, put}) {
            const data = yield call(querySub, parse(payload.params))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        subUsers: data.data
                    }
                })
                callback && callback(data.data)
            }
        },
        * querySummary({payload, callback}, {select, call, put}) {
            const data = yield call(querySummary, parse(payload.params))
            if (data && data.data) {
                callback && callback(data.data)
            }
        },

    },

    reducers: {
        showLoading(state) {
            return {...state, loading: true}
        },
        hideLoading(state) {
            return {...state, loading: false}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            const params = {...state.params, ...action.payload}
            return {...state, ...{params: params}}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetUserWeChats(state, action) {
            return {...state, ...{userWeChats: {}}}
        }
    },

}
