import {queryAll, querySummary, queryPart, queryGroup} from 'services/wechats'

export default {
    namespace: 'wechats',
    state: {
        list: [],
        subWechats: []
    },
    subscriptions: {
        setup({dispatch, history}) {},
    },

    effects: {
        * querySummary({payload, callback}, {select, call, put}) {
            const data = yield call(querySummary, payload)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        subWechats: data.data,
                    }
                })
                callback && callback(data.data)
            }
        },
        * queryAll({payload, callback}, {select, call, put}) {
            const res = yield call(queryAll, payload)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * queryPart({payload, callback}, {select, call, put}) {
            const res = yield call(queryPart, payload)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * queryGroup({payload, callback}, {select, call, put}) {
            const res = yield call(queryGroup, {limit: 10000})
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },

}
