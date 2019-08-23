import {parse} from 'qs'
import { query, queryDetail, clear, } from "community/services/groupMemberRepeat"

const params = {
    limit: 10,
    offset: 0,
    key: undefined,
    status: undefined, // 0否，1是
}

export default {
    namespace: 'community_groupMemberRepeat',
    state: {
        params: {
            ...params
        },
        list: [],
        total: 0,
        current: 1,
        clearModalList: [],
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_groupMemberRepeat}) => community_groupMemberRepeat.params)
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(query, parse(params))
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(res.data)
            }
        },
        * queryDetail({payload, callback}, {select, call, put}) {
            const data = yield call(queryDetail, payload)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        clearModalList: data.data,
                    }
                })
                callback && callback(data.data)
            }
        },
        * clear({payload, callback}, {select, call, put}) {
            const data = yield call(clear, payload)
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params}
        }
    }
}