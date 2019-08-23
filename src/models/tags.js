import {list} from 'services/tags'

export default {
    namespace: 'tags',
    state: {},

    subscriptions: {},

    effects: {
        * list({payload, callback}, {select, call, put}) {
            const data = yield call(list, payload)
            if (data && data.data) {
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    }
}
