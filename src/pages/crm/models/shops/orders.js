import {
    // queryDetail,
    queryImportStatus, detail} from 'crm/services/shops/order'
import {parse} from 'qs'

const params = {
    limit: 10,
    offset: 0,
    query: '',
    sms_status: '',
    bind_status: '',
    product_name: '',
    not_product_name: '',
    not_order_status: '',
    order_status: '',
    store_type: '',
    remark: '',
    store_id: '',
    not_remark: '',
    start_time: '',// moment().subtract(30, 'days').format(DateFormat) + ' 00:00:00',
    end_time: '' // moment().format(DateFormat) + ' 23:59:59',
}
const _stat = {
    list: [],
    loading: false, //加载角色列表
    params: {...params},
    current: 1,
    total: 0,
    importStatusDesc: '订单上传中...',
    importModal: false,
    detailModal: false,
    detailLoading: false,
    detail: null
}
export default {
    namespace: 'crm_orders',
    state: {
        ..._stat
    },

    subscriptions: {},

    effects: {
        // * query({payload, callback}, {select, call, put}) {
        //     yield put({type: 'setProperty', payload: {loading: true}})
        //     let params = yield select(({crm_orders}) => crm_orders.params)
        //     params = {...params, ...payload.params}
        //     if (payload.page) {
        //         params.offset = params.limit * (payload.page - 1)
        //     }
        //     const {data} = yield call(queryDetail, parse(params))
        //     if (data && data.data) {
        //         yield put({
        //             type: 'querySuccess',
        //             payload: {
        //                 list: data.data,
        //                 params: params,
        //                 total: data.pagination.rows_found,
        //                 current: payload.page === undefined ? 1 : payload.page
        //             }
        //         })
        //         callback && callback(data.data)
        //     }
        //     yield put({type: 'setProperty', payload: {loading: false}})
        // },
        * queryImportStatus({payload, callback}, {select, call, put}) {
            const {data} = yield call(queryImportStatus, parse(payload))
            if (data && data.data) {
                let res = data.data
                yield put({
                    type: 'setProperty',
                    payload: {
                        importStatusDesc: res.status,
                        state: res.state
                    }
                })
                callback && callback(data.data)
            }
        },
        * detail({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {detailLoading: true}})
            const {data} = yield call(detail, parse(payload))
            if (data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        detail: data.data,
                    },
                })
                callback && callback(data.data)
            }
            yield put({type: 'setProperty', payload: {detailLoading: false}})
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetState(state, action) {
            return {...state, ..._stat}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload}
            return {...state, ...{params: params}}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        }
    }
}
