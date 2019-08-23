import {queryPart, queryGroup} from 'services/device'

export default {
    namespace: 'device',
    state: {
    },
    subscriptions: {
        setup({dispatch, history}) {},
    },

    effects: {
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
