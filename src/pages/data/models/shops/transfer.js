import {query, queryStats, modify, bindOrder} from 'data/services/shops/transfer'
import {parse} from 'qs'
import moment from 'moment'
import config from 'data/common/config'

const {DateFormat} = config

function getInitParams() {
    return {
        limit: 10,
        offset: 0,
        query: '',
        department_id: undefined,
        user_id: undefined,
        uin: undefined,
        order_id: '',
        store_id: '',
        type: '', //只看转账 ,只看红包 , 只看转出 , 只看转入 , 只看发红包 , 只看收红包 , 只看无金额红包 , 只看人工录入
        status: '',// 0: 待收  3： 已收  -1： 退回
        start_time: moment().subtract(6, 'days').format(DateFormat) + ' 00:00:00',
        end_time: moment().format(DateFormat) + ' 23:59:59',
    }
}

export default {
    namespace: 'data_transfer',
    state: {
        list: [],
        loading: false, //加载角色列表
        editLoading: false,
        params: getInitParams(),
        current: 1,
        stats: {},
        total: 0,
        record: '',
        range: 'week',
    },

    subscriptions: {},

    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loading: true}})
            let params = yield select(({data_transfer}) => data_transfer.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(query, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            } else {
                yield put({type: 'setProperty', payload: {loading: false}})
            }
        },
        * queryStat({payload}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let params = yield select(({data_transfer}) => data_transfer.params)
            params = {...params, ...payload.params}
            const res = yield call(queryStats, parse(params))
            if (res && res.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        stats: res.data
                    }
                })
            }
            yield put({type: 'hideLoading'})
        },
        * modify({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {'editLoading': true}})
            const data = yield call(modify, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'updateSuccess',
                    payload: {
                        record: payload.record
                    }
                })
                callback && callback()
            }
            yield put({type: 'setProperty', payload: {'editLoading': false}})
        },
        * bindOrder({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {'editLoading': true}})
            const data = yield call(bindOrder, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'bindSuccess',
                    payload: payload


                })
                callback && callback()
            }
            yield put({type: 'setProperty', payload: {'editLoading': false}})
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload}
            return {...state, ...{params: params}}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        },
        updateSuccess(state, action) {
            let idx = state.list.findIndex((item) => {
                return item.id === action.payload.record.id
            })
            let list = Array.from(state.list)
            if (idx !== -1) {
                list.splice(idx, 1, action.payload.record)
            }
            return {...state, list: list}
        },
        bindSuccess(state, action) {
            let idx = state.list.findIndex((item) => {
                return item.id === action.payload.record.id
            })
            let list = Array.from(state.list)
            list[idx].outer_order_id = action.payload.body.outer_order_id
            list[idx].store_id = action.payload.body.store_id
            return {...state, list: list}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
        resetRange(state, action) {
            return {...state, ...{range: 'week'}}
        },
    }
}
