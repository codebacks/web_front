import { getAfterOrderList, getAfterDetail, editAfterOrder } from '../../services/orders/afterSale'

export default {
    namespace: 'mall_after_sale',
    state: {
        list: [],
        count: 0,
        orderDetail: {},
        tabValue: 0,
        current: 0,
        pageSize: 10,
        orderNo: '',
        refundNo: '',
        beginAt: '',
        endAt: ''
    },

    effects: {
        * getAfterOrderList({payload, callback}, {select, call, put}) {
            const pageSize = yield select(({review_approval}) => review_approval.pageSize)
            const response = yield call(getAfterOrderList, payload)
            const data = yield response.json()
            const totalCount = response.headers.get('row_count')
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data,
                        count: totalCount,
                        current: payload.page || 0,
                        tabValue: payload.status || 0,
                        pageSize: payload.per_page || pageSize,
                        orderNo: payload.order_no || '',
                        refundNo: payload.no || '',
                        beginAt: payload.begin_at || '',
                        endAt: payload.end_at || ''
                    }
                })
            }
            callback && callback(data)
        },
        * getAfterDetail({payload, callback}, {select, call, put}) {
            const data = yield call(getAfterDetail, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        orderDetail: data
                    }
                })
            }
            callback && callback(data)
        },
        * editAfterOrder({payload, callback}, {select, call, put}) {
            const {status} = yield call(editAfterOrder, payload)
            callback && callback(status)
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        }
    }
}