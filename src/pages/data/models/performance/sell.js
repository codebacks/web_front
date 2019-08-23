import {parse} from 'qs'

import moment from 'moment'
import {
    querySellData,
    downloadSell,
    getTranslateSet,
    getPerformanceDetail,
    setTranslateSet,
    queryUpdateStatus,
    updateData,
    createStatement,
    getShopListOauth,
    createStatementList,
    createAgain,
    updateDataList} from "data/services/performance/sell"
const params = {
    start_at: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    end_at: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    department_id: undefined,
    user_id: undefined,
    type:'2',
    limit:10,
    offset:0,
    sort:'amount',
    platform:undefined,
    shop_id:undefined
}

export default {
    namespace: 'data_performance_sell',
    state: {
        params: {
            ...params
        },
        list: [],
        original: [],
        loading: false,
        current: 1 ,
        total:'',
        range: 'day',
        isOpen:false,
        translateTime:36,
        detailLoading:false,
        detailList:[],
        detailTotal:'',
        updataData:[],
        updataTotal:0,
        shops:[],
        updataLoading:false,
        statementData:[],
        statementTotal:0,
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let params = yield select(({data_performance_sell}) => data_performance_sell.params)
            params = {...params, ...payload.params}
            if(payload.offset){
                params.offset = (payload.offset -1) * params.limit
            }
            const data = yield call(querySellData, parse({...params}))
            if (data && data.data) {
                yield put({
                    type:'querySuccess',
                    payload:{
                        current:payload.offset,
                        params:params,
                        list:data.data,
                        total:data.pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({type: 'hideLoading'})
        },
        *downloadSell({payload, callback}, {select, call, put}) {
            let params = yield select(({data_performance_sell}) => data_performance_sell.params)
            const data = yield call(downloadSell, parse({...params}))
            if (data && data.data) {
                yield put({
                    type:'querySuccess',
                    payload:{
                    }
                })
                callback && callback(data.data)
            }
        }, 
        *getShops({payload, callback}, {select, call, put}) {
            const { data } = yield call(getShopListOauth, {limit: 9999, service: 1})
            if (data) {
                yield put({
                    type:'querySuccess',
                    payload:{
                        shops:data
                    }
                })
                callback && callback(data)
            }
        },
        *updateData({payload, callback}, {select, call, put}) {
            const {meta} = yield call(updateData, payload)
            if (meta.code == 200) {
                callback && callback()
            }
        },

        *queryUpdateStatus({payload, callback}, {select, call, put}) {
            const { data } = yield call(queryUpdateStatus, payload)
            if (data) {
                callback && callback(data.schedule)
            }
        }, 
        *createStatement({payload, callback}, {select, call, put}) {
            // let params = yield select(({data_performance_sell}) => data_performance_sell.params)
            // let param = Object.assign({},params,payload)
            // const { meta } = yield call(downloadSell, parse({...param}))
            const { meta } = yield call(downloadSell, payload)
            if (meta.code == 200) {
                callback && callback()
            }
        },
        *createAgain({payload, callback}, {select, call, put}) {
            const { meta } = yield call(createAgain, payload)
            if (meta.code == 200) {
                callback && callback()
            }
        },
        *createStatementList({payload, callback}, {select, call, put}) {
            yield put({type:'setProperty',payload:{updataLoading:true}})
            const { data , pagination } = yield call(createStatementList, payload)
            if (data ) {
                yield put({
                    type:'querySuccess',
                    payload:{
                        statementData:data,
                        statementTotal:pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({type:'setProperty',payload:{updataLoading:false}})
        },
        *updateDataList({payload, callback}, {select, call, put}) {
            yield put({type:'setProperty',payload:{updataLoading:true}})
            const { data , pagination } = yield call(updateDataList, payload)
            if (data ) {
                yield put({
                    type:'querySuccess',
                    payload:{
                        updataData:data,
                        updataTotal:pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({type:'setProperty',payload:{updataLoading:false}})
        }, 
        *getTranslateSet({payload, callback}, {select, call, put}) {
            const data = yield call(getTranslateSet, payload)
            if (data && data.meta.code ==200) {
                yield put({
                    type:'querySuccess',
                    payload:{
                        isOpen:data.data.chat_translation,
                        translateTime:data.data.chat_interval
                    }
                })
                callback && callback(data.data)
            }
        }, 
        *setTranslateSet({payload, callback}, {select, call, put}) {
            const data = yield call(setTranslateSet, payload)
            if (data && data.meta.code ==200) {
                callback && callback()
            }
        }, 
        *getPerformanceDetail({payload,callback},{select,call,put}){
            yield put({type:'setProperty',payload:{detailLoading:true}})  
            const {data,pagination}  = yield call (getPerformanceDetail,payload)
            if(data){
                yield put({
                    type:'querySuccess',
                    payload:{
                        detailList:data,
                        detailTotal:pagination.rows_found
                    }
                })
                callback && callback(data)
            }
            yield put({type:'setProperty',payload:{detailLoading:false}})

        }
    },

    reducers: {
        showLoading(state) {
            return {...state, loading: true}
        },
        hideLoading(state) {
            return {...state, loading: false}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        }
    }
}