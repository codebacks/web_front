import {vipRankList, vipRankUpdate, vipList, vipRankDetail, vipListByUser, getUserList, getVipDetail, getOrderList} from 'crm/services/vip'
import { getToken } from 'setting/services/shops'
export default {
    namespace: 'vip_data',
    state: {
        vipRankList: [],
        vipList: [],
        userList: [],
        photoToken: '',
        total: 0,
        vipDetail: {},
        orderList: [],
        orderCurrent: 1,
        orderPageSize: 10,
        orderTotal: 0, 
    },
    subscriptions: {},
    effects: {
        * vipRankList({payload, callback}, {select, call, put}) {
            const { data } = yield call(vipRankList, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        vipRankList: data,
                    },
                })
                callback && callback(data)
            }
        },
        * vipRankDetail({payload, callback}, {select, call, put}) {
            const { data } = yield call(vipRankDetail, payload)
            if(data) {
                callback && callback(data)
            }
        },
        * vipRankUpdate({payload, callback}, {select, call, put}) {
            const { data } = yield call(vipRankUpdate, payload)
            if(data) {
                callback && callback(data)
            }
        },
        * vipList({payload, callback}, {select, call, put}) {
            const  {data, pagination}  = yield call(vipList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        vipList: data,
                        total: pagination.rows_found || 0,
                    },
                })
                callback && callback(data)
            }
        },
        * vipListByUser({payload, callback}, {select, call, put}) {
            const  {data, pagination}  = yield call(vipListByUser, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        vipList: data,
                        total: pagination.rows_found || 0,
                    },
                })
                callback && callback(data)
            }
        },
        * getUserList({payload, callback}, {select, call, put}) {
            const { data } = yield call(getUserList, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        userList: data,
                    },
                })
                callback && callback(data)
            }
        },
        * getVipDetail({payload, callback}, {select, call, put}) {
            const { data } = yield call(getVipDetail, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        vipDetail: data,
                    },
                })
                callback && callback(data)
            }
        },
        * getOrderList({payload, callback}, {select, call, put}) {
            const { data, pagination } = yield call(getOrderList, payload)
            if(data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        orderList: data,
                        orderCurrent: ((pagination.offset/pagination.limit) + 1) || 0,
                        orderPageSize: pagination.limit || 10,
                        orderTotal: pagination.rows_found || 0,
                    },
                })
                callback && callback(data)
            }
        },
        *getToken ({ payload, callback }, { call, put }) {
            const data = yield call(getToken, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        photoToken: data.data.token,
                    },
                })
            }
        },
    },
    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    }
}
