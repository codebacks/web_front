
import { getShopListOauth, getToken } from 'setting/services/shops'
import { getOrderList, saveOrder, saveMemo, getFailItem, getShopOrderList } from 'setting/services/orders'
export default {
    namespace: 'setting_ordersImport',
    state: {
        photoToken: '',
        currentItem: {},
        shopDataOrder: [],
        params: {
            shop_id: '',
            status: '',
            begin_at: '',
            end_at: '',
            offset: '',
            limit: '',
        },
        currentPage: 1,
        perPage: 10,
        totalPage: 0,
        OrderData: [],

        failParams: {
            offset: '',
            limit: '',
            order_no: '',
        },
        failItem: [],
        totalFail: 0,
        currentFail: 1,
        loading: false,
    },
    effects: {
        //获取权限店铺列表
        *getShopList({payload, callback},{call, put}){
            const data = yield call(getShopListOauth, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        shopDataOrder: data.data,
                    }
                })
            }
        },
        //获取导入的订单列表
        *getOrderList({payload, callback},{select, call, put}){
            let params = yield select(({setting_ordersImport}) => setting_ordersImport.params)
            let currentPage = yield select(({setting_ordersImport}) => setting_ordersImport.currentPage)
            let perPage = yield select(({setting_ordersImport}) => setting_ordersImport.perPage)
            if(payload.perPage){
                params.limit = payload.perPage
            }else{
                params.limit = perPage
            }
            if(payload.currentPage){
                params.offset = (payload.currentPage - 1) * params.limit
            }else{
                params.offset = (currentPage - 1) * params.limit
            }
            payload.shop_id === undefined ? params.shop_id = '' : params.shop_id = payload.shop_id
            payload.status === undefined ? params.status = '' : params.status = payload.status
            payload.begin_at === undefined ? params.begin_at = '' : params.begin_at = payload.begin_at
            payload.end_at === undefined ? params.end_at = '' : params.end_at = payload.end_at
            const data = yield call(getOrderList, {...params,...payload})
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        OrderData: data.data,
                        totalPage: data.pagination.rows_found,
                        currentPage: payload.currentPage === undefined ? currentPage : payload.currentPage,
                        perPage: payload.perPage === undefined ? perPage : payload.perPage,
                    }
                })
                callback && callback(data)
            }
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
        //保存导入的订单
        *saveOrder({payload, callback},{call, put}){
            const data = yield call(saveOrder, payload)
            if(data){
                callback && callback(data)
            }
        },
        *saveMemo({payload, callback},{call, put}){
            const data = yield call(saveMemo, payload)
            if(data){
                callback && callback(data)
            }
        },
        *getFailItem({payload, callback},{select, call, put}){
            let failParams = yield select(({setting_ordersImport}) => setting_ordersImport.failParams)
            const limitNum = 10
            console.log(payload)
            if(payload.currentFail){
                failParams.offset = (payload.currentFail - 1) * limitNum
                failParams.limit = limitNum
            }else{
                failParams.offset = 0
                failParams.limit = limitNum
            }
            if(payload.order_no){
                failParams.order_no = payload.order_no
            }else{
                failParams.order_no = ''
            }
            failParams.id = payload.id
            const data = yield call(getFailItem, failParams)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        failItem: data.data, 
                        totalFail: data.pagination.rows_found, 
                        currentFail: payload.currentFail === undefined ? 1 : payload.currentFail,
                    },
                })
                callback && callback(data)
            }
        },
        //获取店铺订单列表
        *getShopOrderList({payload, callback},{call, put}){
            const data = yield call(getShopOrderList, payload)
            if(data){
                callback && callback(data)
            }
        },



    },
    reducers: {
        setProperty(state, action){
            return {...state, ...action.payload}
        },
    },
}