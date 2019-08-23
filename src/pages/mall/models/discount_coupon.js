import {
    goods,
    couponDataList,
    checkDetail,
    createCoupon,
    echartsData,
    couponData,
    getgoodsList,
    solidOut,
    putaway,
    cancellation,
} from 'mall/services/discount_coupon'


export default {
    namespace:'mall_discount_coupon',
    state:{
        goodsList:[],
        goods_rows_found:0,
        loading:false,
        couponDataList:[],
        couponDataList_total:0,
        checkDetail:{},
        echartsData:[],
        
        couponData:[],
        couponData_total:0,

        getgoodsList:[],
        getgoodsList_total:0
    },  
    effects:{
        // 优惠券列表
        *couponDataList({payload,callback},{call,put}){
            const data = yield call(couponDataList,payload)
            if(data && data.data){
                yield put({
                    type:'setProperty',
                    payload:{
                        couponDataList:data.data,
                        couponDataList_total:data.pagination.rows_found
                    }
                })
            }
            callback && callback(data)
        },
        *checkDetail({payload,callback},{call,put}){
            const data = yield call(checkDetail,payload)
            if(data && data.data){
                yield put({
                    type:'setProperty',
                    payload:{
                        checkDetail:data.data,
                    }
                })
            }
            callback && callback(data)
        },
        // 商品列表
        *goods({ payload, callback }, { call, put }) {
            const response = yield call(goods, payload)
           
            let count = response.headers.get('row_count')
            const json = yield  response.json()
            if(response){
                yield put({
                    type: 'setProperty',
                    payload: {
                        goodsList:json,
                        goods_rows_found:Number(count)
                    }
                })
                callback && callback(json)
            }
        },
        *createCoupon({payload,callback},{call,put}){
            const data = yield call(createCoupon,payload)
            callback && callback(data)
        },
        *echartsData({payload,callback},{call,put}){
            const data = yield call(echartsData,payload)
            if(data && data.data){
                yield put({
                    type:'setProperty',
                    payload:{
                        echartsData:data.data
                    }
                })
            }
            callback && callback(data)
        },
        *couponData({payload,callback},{call,put}){
            const data = yield call(couponData,payload)
            if(data && data.data){
                yield put({
                    type:'setProperty',
                    payload:{
                        couponData:data.data,
                        couponData_total:data.pagination.rows_found
                    }
                })
            }
            callback && callback(data)
        },
        // 商品列表
        *getgoodsList({ payload, callback }, { call, put }) {
            const response = yield call(getgoodsList, payload)
            let count = response.headers.get('row_count')
            const json = yield  response.json()
            if(response){
                yield put({
                    type: 'setProperty',
                    payload: {
                        getgoodsList:json,
                        getgoodsList_total:Number(count)
                    }
                })
                callback && callback(json)
            }
        },
        *solidOut({payload,callback},{call,put}){
            const data = yield call(solidOut,payload)
            callback && callback(data)
        },
        *putaway({payload,callback},{call,put}){
            const data = yield call(putaway,payload)
            callback && callback(data)
        },
        *cancellation({payload,callback},{call,put}){
            const data = yield call(cancellation,payload)
            callback && callback(data)
        },
    },
    reducers:{
        setProperty(state,action){
            return {...state,...action.payload}
        }
    }
}
