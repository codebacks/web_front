import { commissionsList, pass, transactions } from '../../../mall/services/distributor/commissions'

export default {
    namespace: 'commissions',
    state: {
        rows_found: 0,
        commissionsList: []
    },
    effects: {
        *commissionsList({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(commissionsList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        commissionsList: data,
                        rows_found: pagination.rows_found
                    },
                })
            }
            callback && callback()
        },
        * pass({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(pass, payload)
            callback && callback(meta)
        },
        * transactions({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(transactions, payload)
            callback && callback(meta)
        },
    }, reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    }
}