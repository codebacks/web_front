import { getOrders, exportOrder, importLogistics } from '../services/importOrder'
import { getShopListOauth, getToken } from 'setting/services/shops'

export default {
    namespace: 'setting_orders_import_shop',
    state: {
        photoToken: '',
        list: [],
        total: 0,
        shops: [],
        current: '',
        pageSize: '',
        exportUrl: '',
    },
    effects: {
        * getShops({payload, callback},{select, call, put}){
            const { data } = yield call(getShopListOauth, {limit: 9999, service: 1})

            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        shops: data
                    },
                })
            }
            callback && callback()
        },
        //获取导入的订单列表
        * getOrderList({payload, callback},{select, call, put}){
            const { data, pagination, error } = yield call(getOrders, payload.condition, payload.pageOptions)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        current: payload.pageOptions.pageIndex || 1,
                        pageSize: payload.pageOptions.pageSize || 10,
                        list: data,
                        total: pagination.rows_found
                    },
                })
            }
            callback && callback(data, error)
        },
        *getToken({payload, callback},{call, put}){
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
        * exportOrder({payload, callback},{select, call, put}){
            const { data } = yield call(exportOrder, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        exportUrl: data.url,
                    },
                })
            }
            callback && callback()
        },
        * importLogistics({payload, callback},{select, call, put}){
            const {data} = yield call(importLogistics, payload)
            callback && callback(data)
        },
    },
    reducers: {
        setProperty(state, action){
            return {...state, ...action.payload}
        }
    }
}
