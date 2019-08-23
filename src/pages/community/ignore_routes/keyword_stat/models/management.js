import {list} from 'community/services/keyword/management'
import {create, remove} from 'community/services/keyword/stat'

const params = {
    limit: 100,
    offset: 0,
    key: '',
    start_time: '',
    end_time: '',
    order_by: '',
}

export default {
    namespace: 'community_keyword_mgt',
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
            let params = yield select(({community_keyword_mgt}) => community_keyword_mgt.params)
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
        * create({payload, callback}, {call}) {
            const res = yield call(create, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * remove({ payload, callback }, { select, call, put }) {
            const res = yield call(remove, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
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