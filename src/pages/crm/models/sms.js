import {queryAll} from 'crm/services/shops/order'
import {query as queryMembers} from 'crm/services/shops/member'
import {queryTemplates, createTask, querySign} from '../services/sms'
// import {queryWechatsByCompany} from 'crm/services/wechats'
import {parse} from 'qs'

export default {
    namespace: 'crm_sms',
    state: {
        list: [],
        wechats: [],
        templates: [],
        signs: [],
        invalid_mobile: 0,
        loading: false,
        createLoading: false,
        modal: false,
        confirmModal: false,
        loadingMember: false,
        sendModal: false
    },
    subscriptions: {},
    effects: {
        * queryOrders({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loadingList: true}})
            let params = yield select(({crm_orders}) => crm_orders.params) ///使用订单条件查询
            const {data} = yield call(queryAll, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data.list,
                        loadingList: false
                    }
                })
                callback && callback(data.data)
            } else {
                yield put({type: 'setProperty', payload: {loadingList: false}})
            }
        },
        * queryMembers({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loadingMember: true}})
            let {params, total} = yield select(({crm_members}) => crm_members)
            let _params = {...params}
            _params.limit = total
            const {data} = yield call(queryMembers, parse(_params))
            if (data && data.data && data.data.length) {
                let res = data.data
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: res,
                        loadingMember: false
                    }
                })
                callback && callback(data.data)
            } else {
                yield put({type: 'setProperty', payload: {loadingMember: false}})
            }
        },

        * queryTemplates({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loading: true}})
            const {data} = yield call(queryTemplates, parse({
                offset: 0,
                limit: 1000,
                include_sys: payload.includesSysTemplate,
                store_type: payload.store_type || ''
            }))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        templates: data.data,
                    }
                })
                callback && callback(data.data)
            }
            yield put({type: 'setProperty', payload: {loading: false}})
        },
        * querySign({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loading: true}})
            const {data} = yield call(querySign, parse({
                offset: 0,
                limit: 1000
            }))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        signs: data.data,
                    }
                })
                callback && callback(data.data)
            }
            yield put({type: 'setProperty', payload: {loading: false}})
        },

        // * queryWechatsByCompines({payload}, {call, put}) {
        //     yield put({type: 'setProperty', payload: {loading: true}})
        //     let res = yield call(queryWechatsByCompany, parse(payload))
        //     if (res && res.data) {
        //         yield put({
        //             type: 'querySuccess',
        //             payload: {
        //                 wechats: res.data.data
        //             }
        //         })
        //     }
        //     yield put({type: 'setProperty', payload: {loading: false}})
        // },
        * create({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {createLoading: true}})
            const {data} = yield call(createTask, parse(payload.body))
            if (data && data.data) {
                callback && callback()
            }
            yield put({type: 'setProperty', payload: {createLoading: false}})
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
        removeItem(state, action) {
            let list = Array.from(state.list)
            list = list.filter((item) => {
                return item.id !== action.payload.id
            })
            return {...state, list}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload}
        }
    }
}
