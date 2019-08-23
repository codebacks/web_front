import {
    getOrderList,
    orderDetail,
    getOrderSetting,
    resetOrderSetting,
    editTotalPrice,
    getExpress,
    editExpress,
    orderExport
} from '../../services/orders/orderList'

export default {
    namespace: 'mall_order_list',
    state: {
        list: [],
        count: 0,
        orderDetail: {},
        orderSetting: {},
        express: {},
        tabValue: '',
        current: 0,
        pageSize: 10,
        orderNo: '',
        phoneNo: '',
        beginAt: '',
        endAt: '',
        goodsName: ''
    },

    effects: {
        * getOrderList({payload, callback}, {select, call, put}) {
            const pageSize = yield select(({mall_order_list}) => mall_order_list.pageSize)
            const response = yield call(getOrderList, payload)
            const data = yield response.json()
            const totalCount = response.headers.get('row_count')
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data,
                        count: totalCount,
                        tabValue: payload.status || '',
                        current: payload.page || 0,
                        pageSize: payload.per_page || pageSize,
                        orderNo: payload.no || '',
                        phoneNo: payload.mobile || '',
                        beginAt: payload.begin_at || '',
                        endAt: payload.end_at || '',
                        goodsName: payload.name || ''
                    }
                })
            }
            callback && callback(data)
        },
        * orderDetail({payload, callback}, {select, call, put}) {
            const data = yield call(orderDetail, payload)
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
        * getOrderSetting({payload, callback}, {select, call, put}) {
            const data = yield call(getOrderSetting, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        orderSetting: data
                    }
                })
            }
            callback && callback(data)
        },
        * resetOrderSetting({payload, callback}, {select, call, put}) {
            const {status} = yield call(resetOrderSetting, payload)
            callback && callback(status)
        },
        * editTotalPrice({payload, callback}, {select, call, put}) {
            const {status} = yield call(editTotalPrice, payload)
            callback && callback(status)
        },
        * getExpress({payload, callback}, {select, call, put}) {
            const data = yield call(getExpress, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        express: data
                    }
                })
            }
            callback && callback(data)
        },
        * editExpress({payload, callback}, {select, call, put}) {
            const {status} = yield call(editExpress, payload)
            callback && callback(status)
        },
        * orderExport({payload, callback}, {select, call, put}) {
            const data = yield call(orderExport, payload)
            callback && callback(data)
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        }
    }
}