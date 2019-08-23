import { guidances, hideGuidances } from 'services/guide'

export default {
    namespace: 'guide',
    state: {},
    effects: {
        // 引导
        * guidances({ payload, callback }, { select, call, put }) {
            const { data } = yield call(guidances, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                })
                callback && callback(data)
            }
        },
        * hideGuidances({ payload, callback }, { select, call, put }) {
            const { data } = yield call(hideGuidances, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                })
                callback && callback(data)
            }
        }
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    }
}
