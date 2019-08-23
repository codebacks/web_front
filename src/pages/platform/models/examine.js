import { listData, activitiesDetail, orderDetail, pass, reject, batchPass, batchReject, confirm, remove, failPaymentDetail, reviewsDetail, batchConfirm, batchDelete, activity_shops, sync_order } from 'platform/services/examine'


export default {
    namespace: 'platform_examine',
    state: {
        examineData: [],
        rows_found: 0,
        activitiesDetailData: [],
        orderDetailData: [],
        remarksData: [],
        reviewData: '',
        params: {
            status: '',
            pay_status: '',
        },
        activityShopsData: "",
        reviewsDetailData: "",
        syncOrderData: ''
    },
    effects: {
        //审核数据列表
        * listData({ payload, callback }, { select, call, put }) {
            yield put({ type: 'setProperty', payload: { loading: true } })
            const { data, pagination } = yield call(listData, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        examineData: data,
                        rows_found: pagination.rows_found
                    },
                })
            }
            yield put({ type: 'setProperty', payload: { loading: false } })
        },
        // 审核活动详情
        *activitiesDetail({ payload, callback }, { select, call, put }) {
            const data = yield call(activitiesDetail, payload.id)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        activitiesDetailData: data.data,
                    },
                })
            }
            callback && callback()
        },
        // 审核订单详情
        *orderDetail({ payload, callback }, { select, call, put }) {
            const data = yield call(orderDetail, payload.id)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        orderDetailData: data.data,
                    },
                })
            }
            callback && callback()
        },
        //通过
        * pass({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(pass, payload)
            callback && callback(meta)
        },
        //拒绝
        * reject({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(reject, payload.data)
            callback && callback(meta)
        },
        // 确认
        * confirm({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(confirm, payload)
            callback && callback(meta)
        },
        //删除
        * remove({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(remove, payload)
            if (meta) {
                callback && callback(meta)
            }
        },
        // 付款失败原因
        * failPaymentDetail({ payload, callback }, { select, call, put }) {
            const { data } = yield call(failPaymentDetail, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        remarksData: data
                    },
                })
            }
            callback && callback()
        },
        // 审核记录详情
        *reviewsDetail({ payload, callback }, { select, call, put }) {
            const data = yield call(reviewsDetail, payload.id)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        reviewsDetailData: data.data,
                    },
                })
            }
            callback && callback()
        },
        * batchPass({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(batchPass, payload)
            if (meta) {
                callback && callback(meta)
            }
        },
        * batchReject({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(batchReject, payload.data)
            if (meta) {
                callback && callback(meta)
            }
        },
        * batchConfirm({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(batchConfirm, payload)
            if (meta) {
                callback && callback(meta)
            }
        },
        * batchDelete({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(batchDelete, payload)
            if (meta) {
                callback && callback(meta)
            }
        },
        // 多店铺列表
        * activity_shops({ payload, callback }, { select, call, put }) {
            const data = yield call(activity_shops, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        activityShopsData: data.data,
                    },
                })
            }
        },
        // 同步订单
        *sync_order({ payload, callback }, { select, call, put }) {
            const data = yield call(sync_order, payload.id)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        syncOrderData: data.data,
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
