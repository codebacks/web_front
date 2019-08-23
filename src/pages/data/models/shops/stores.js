import {query, create, modify} from 'data/services/shops/store'
import {parse} from 'qs'
export default {
    namespace: 'data_stores',
    state: {
        list: [],
        loading: false,
        createLoading: false,
        editLoading: false,
        params: {
            limit: 10,
            offset: 0
        },
        total: 0,
        current: 1,
        editModal: false,
        createModal: false,
        record: null
    },

    subscriptions: {},

    effects: {
        *query({payload, callback}, {select, call, put}) {
            yield put({type: 'showLoading', payload: true})
            let params = yield select(({data_stores}) => data_stores.params) //取当前 state
            params = {...params, ...payload.params}
            if (payload.page) {
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
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            } else {
                yield put({type: 'hideLoading', payload: false})
            }
        },
        *create({payload, callback}, {call, put}) {
            yield put({type: 'setAttribute', payload: {'createLoading': true}})
            yield put({type: 'showCreateLoading'})
            const data = yield call(create, payload.body)
            if (data && data.data) {
                yield put({
                    type: 'createSuccess',
                    payload: data.data,
                })
                callback && callback()
            }
            yield put({type: 'setAttribute', payload: {'createLoading': false}})
        },
        *modify({payload, callback}, {call, put}) {
            yield put({type: 'setAttribute', payload: {'editLoading': true}})
            const data = yield call(modify, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'updateSuccess',
                    payload: {
                        // record: payload.record
                    }
                })
                callback && callback()
            }
            yield put({type: 'setAttribute', payload: {'editLoading': false}})
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
        updateSuccess(state, action) {
            return {...state, ...action.payload, editLoading: false}
        },
        setAttribute(state, action){
            return {...state, ...action.payload}
        }

    }
}
