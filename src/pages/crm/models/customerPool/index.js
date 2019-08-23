import {parse} from 'qs'
import { getShopListOauth } from '../../../setting/services/shops'
import { smsSignatureList,smsCount,userPoolList,editRemark,importData,getUploadToken,importList,errorList,exportErrorList,sendSms, smsModelList,getShopList,filterUserPool } from '../../services/customerPool';
import moment from 'moment'

const params = {
    limit: 10,
    offset: 0,
    is_wechat_binded:'0',
    begin_time:'',
    keyword:'',
    end_time:'' ,
    remark_include:'',
    order_amount_begin:'',
    order_amount_end:'',
    average_amount_begin:'',
    average_amount_end:'',
    shop_id:'',
    type:'',
    platform_type:'',
    data_from:''
}

const filtrateParams={
    is_wechat_binded:0,
    begin_time:'',
    keyword:'',
    end_time:'' ,
    remark_include:'',
    order_amount_begin:'',
    order_amount_end:'',
    average_amount_begin:'',
    average_amount_end:'',
    shop_id:'',
    type:'',
    platform_type:'',
    data_from:''
}

const param={
    id:'',
    offset:1,
    limit:10
}
export default {
    namespace: 'crm_customerPool',
    state: {
        list: [],
        uploadToken:'',
        loading: false, //加载角色列表
        params: {...params},
        param:{...param},
        filtrateParams:{...filtrateParams},
        current: 1,
        total: 0,
        exportUrl:'',
        limit:10,
        errorTotal:0,
        offset:1,
        record: {},
        data:[],
        detailList:[],
        createModal: false,
        editLoading: false,
        smsCount:0,
        UserPoolCount:0,
        smsModelList:[],
        shopList:[],
        signatureList:[],
        shops: [],
        filterCount:0,
        step:false,
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
        *getUploadToken({payload, callback}, {select, call, put}) {
            const data = yield call(getUploadToken, payload)
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                       uploadToken:data.data.token
                    }
                })
                callback && callback(data.data)
            } 
        },
        *getSmsModelList({payload, callback}, {select, call, put}) {
            const data = yield call(smsModelList, payload)
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        smsModelList:data.data
                    }
                })
                callback && callback(data.data)
            } 
        },
        *getShopList({payload, callback}, {select, call, put}) {
            const data = yield call(getShopList, payload)
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        shopList:data.data
                    }
                })
                callback && callback(data.data)
            } 
        },
        *sendSms({payload, callback}, {select, call, put}) {
            const data = yield call(sendSms, payload)
            if(data && data.meta.code == 200){
                callback && callback()
            } 
        },
        *smsSignatureList({payload, callback}, {select, call, put}) {
            const data = yield call(smsSignatureList, payload)
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        signatureList:data.data
                    }
                })
                callback && callback(data.data)
            } 
        },
        *userPoolList({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loading: true}})
            const pageSize = yield select(({crm_customerPool}) => crm_customerPool.pageSize)
            if(payload.begin_time && payload.end_time){
                payload.begin_time =payload.begin_time +' 00:00:00'
                payload.end_time =payload.end_time +' 23:59:59'
            }
            if(payload.order_amount_begin){
                payload.order_amount_begin = payload.order_amount_begin *100
            }
            if(payload.order_amount_end){
                payload.order_amount_end = payload.order_amount_end *100
            }
            if(payload.average_amount_end){
                payload.average_amount_end = payload.average_amount_end *100
            }
            if(payload.average_amount_begin){
                payload.average_amount_begin = payload.average_amount_begin *100
            }
            const data = yield call(userPoolList, parse(payload))
            if ( data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        detailList: data.data,
                        params:{...payload},
                        total: data.pagination?data.pagination.rows_found:0,
                        current: payload.offset === undefined ? 1 : payload.offset
                    }
                })
                callback && callback(data.data)
            } 
        },
        *importList({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loading: true}})
            const data = yield call(importList, payload)
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data,
                        params: param,
                        total: data.pagination?data.pagination.rows_found:0,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            }
        },
        *importData({payload, callback}, {select, call, put}) {
            const data = yield call(importData, payload)
            if(data.meta.code==200){
                callback && callback(data.data)
            } 
        },
        *smsCount({payload, callback}, {select, call, put}) {
            const data = yield call(smsCount, payload)
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        smsCount:data.data.message_count
                    }
                })
                callback && callback(data.data)
            } 
        },
        *filterUserPool({payload, callback}, {select, call, put}) {
            if(payload.order_amount_begin){
                payload.order_amount_begin = payload.order_amount_begin *100
            }
            if(payload.order_amount_end){
                payload.order_amount_end = payload.order_amount_end *100
            }
            if(payload.average_amount_end){
                payload.average_amount_end = payload.average_amount_end *100
            }
            if(payload.average_amount_begin){
                payload.average_amount_begin = payload.average_amount_begin *100
            }
            if(!payload.is_wechat_binded){
                payload.is_wechat_binded = 0
            }
            const data = yield call(filterUserPool, payload)
    
            if(data.data){
                yield put({
                    type: 'querySuccess',
                    payload: {
                        UserPoolCount: data.data.unique_mobile_count,
                        params:{
                            ...payload
                        }
                    }
                })
                callback && callback(data.data)
            } 
        },
        *filterUserPools({payload, callback}, {select, call, put}) {
           
            if(!payload.is_wechat_binded){
                payload.is_wechat_binded = 0
            }
            if(payload.order_amount_begin){
                payload.order_amount_begin = payload.order_amount_begin *100
            }
            if(payload.order_amount_end){
                payload.order_amount_end = payload.order_amount_end *100
            }
            if(payload.average_amount_end){
                payload.average_amount_end = payload.average_amount_end *100
            }
            if(payload.average_amount_begin){
                payload.average_amount_begin = payload.average_amount_begin *100
            }
            const data = yield call(filterUserPool, payload)
            if(data.data){
                yield put({
                    type: 'querySuccess',
                    payload: {
                        filterCount: data.data.unique_mobile_count,
                        filtrateParams:{
                            ...payload
                        }
                    }
                })
                callback && callback(data.data)
            } 
        },
        *errorList({payload,callback},{select,call,put}){
            yield put({type: 'setProperty', payload: {loading: true}})
            const data = yield call(errorList,payload)
            if (data && data.data.length>0) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        data: data.data,
                        errorTotal: data.pagination.rows_found
                    }
                })
                callback && callback(data.data)
            }else{
                yield put({
                    type: 'querySuccess',
                    payload: {
                        data: []
                    }
                })  
            }
            yield put({type: 'setProperty', payload: {loading: false}})
        },
        *exportErrorList({payload,callback},{select,call,put}){
            const data = yield call(exportErrorList,payload)
            if (data.meta.code == 200) {
                callback && callback(data.data)
            }
        },
        *editRemark({payload,callback},{call,put}){
            const data = yield call(editRemark,payload)
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                    }
                })
                callback && callback()
            }
            
        }
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
    }
}
