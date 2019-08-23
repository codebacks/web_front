import { managementList, update } from '../../../mall/services/distributor/distributor_management'

export default {
    namespace: 'distributor_management',
    state: {
        rows_found: 0,
        managementList: []
    },
    effects: {
        *managementList({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(managementList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        managementList: data,
                        rows_found: pagination.rows_found
                    },
                })
            }
            callback && callback()
        },
        * update({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(update, payload.data)
            if (meta) {
                callback && callback(meta)
            }
        },
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    }
}
