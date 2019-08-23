import { orderList, orderDetail } from '../../../mall/services/distributor/distributor_order'

export default {
    namespace: 'distributor_order',
    state: {
        rows_found: 0,
        orderList: []
    },
    effects: {
        *orderList({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(orderList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        orderList: data,
                        rows_found: pagination.rows_found
                    },
                })
            }
            callback && callback()
        },
        * orderDetail({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(orderDetail, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        orderList: data,
                        rows_found: pagination.rows_found
                    },
                })
            }
            callback && callback()
        },
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    }
}
