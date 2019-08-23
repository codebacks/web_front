import {queryTreesCurrent, queryTrees} from 'services/departments'
import {parse} from 'qs'

export default {
    namespace: 'departments',
    state: {
        trees: [],
        treesAll: [],
        list: [],
        params: {},

    },
    subscriptions: {},
    effects: {
        * queryTreesCurrent({payload, callback}, {call, put}) {
            const data = yield call(queryTreesCurrent, parse(payload.params))
            if (data && data.data && data.data.length) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        trees: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },
        * queryTrees({payload, callback}, {call, put}) {
            const data = yield call(queryTrees, parse(payload.params))
            if (data && data.data && data.data.length) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        treesAll: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            const params = {...state.params, ...action.payload}
            return {...state, ...{params: params}}
        },
        resetTrees(state, ) {
            return {...state, ...{trees: []}}
        },
    }
}