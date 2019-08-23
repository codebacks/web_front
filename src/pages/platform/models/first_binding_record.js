import { firstListData, listData } from 'platform/services/first_binding_record'

export default {
    namespace: 'first_binding_record',

    state: {
        rows_found: 0,
        firstListData: []
    },
    effects: {
        * firstListData({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(firstListData, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        firstListData: data,
                        rows_found: pagination.rows_found
                    },
                })
            }
            callback && callback(data)
        },
        * listData({ payload, callback }, { select, call, put }) {
            const { data } = yield call(listData, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        listData: data,
                    },
                })
            }
            callback && callback(data)
        },
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}