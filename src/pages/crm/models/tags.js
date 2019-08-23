import {query} from 'crm/services/tags'
import {parse} from 'qs'

export default {
    namespace: 'crm_tags',
    state: {
        params: {
            limit: 10,
            offset: 0,
        },
        total: 0,
        current: 1,
        list: [],
        loading: false,
        createModal: false,
        editModal: false,
        updateLoading: false,
        record: {},
    },

    subscriptions: {},

    effects: {
        * query({payload}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let params = yield select(({crm_tags}) => crm_tags.params)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(query, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page,
                    }
                })
            } else {
                yield put({type: 'hideLoading'})
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
            return {...state, ...action.payload, loading: false}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    }
}
