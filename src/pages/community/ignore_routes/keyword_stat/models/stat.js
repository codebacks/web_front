import {list, summary} from 'community/services/keyword/stat'

const params = {
    limit: 100,
    offset: 0,
    key: '',
    start_time: '',
    end_time: '',
    order_by: '',
}

export default {
    namespace: 'community_keyword_stat',
    state: {
        params: {
            ...params
        },
        list: [],
        total: 0,
        current: 1,
    },
    subscriptions: {},
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let params = yield select(({community_keyword_stat}) => community_keyword_stat.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            if (params.key) {
                params.key = params.key.trim()
            }
            const data = yield call(list, params)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: parseInt(data.pagination.offset / data.pagination.limit, 10) + 1
                    }
                })
            }
        },
        * summary({payload, callback}, {select, call, put}) {
            const res = yield call(summary, payload)
            if (res && res.data) {
                callback && callback(res.data)
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