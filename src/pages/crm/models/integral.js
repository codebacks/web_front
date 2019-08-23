/**
 **@Description:
 **@author: yecuilin
 */

import {
    getSummary,
    searchSummaryList,
    searchPointsList,
    getsettingData,
    pointsListDetail,
    getAuthshops,
    getGzhList,
    updateSetting,
    exportReport,
    getExchangeList,
    exportOrder,
    deliverGoods,
    getMallList,
    getMallDetail,
    editMall,
    toggleAward,
    deleteAward,
    getAwardList,
    getAwardDetail,
    editAward,
    getExpressList,
    changeIntegral,
} from 'crm/services/integral'
import { getToken } from 'setting/services/shops'
export default {
    namespace: 'crm_intergral',

    state: {
        dataSummary:{},
        searchSummaryList:[],
        SummaryTotal:'',
        searchPointsList:[],
        PointsListTotal:'',
        getsettingData:{},
        pointsListDetail:[],
        pointsListDetailTotal:'',
        getAuthshops:[],
        getGzhList:[],
        exchangeList: [],
        exchangeListTotal: 0,
        getGoodsList: [],
        goodsListTotal: 0,
        getMallList: '',
        getMallListTotal: 0,
        getMallDetail: {},
        getAwardDetail: {},
        photoToken: '',
        express: {},

        subSetting:false,
        pointDetailLoading:false,
        PointsListLoading:false,
        exportReportLoading:false,
        SummaryListLoading:false,
    },

    effects: {
        // 积分总览
        * getSummary({payload, callback}, {select, call, put}) {
            const data = yield call(getSummary, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        dataSummary: data.data                      
                    }
                })
            }
        },
        * searchSummaryList({payload, callback}, {select, call, put}) {
            yield put({ type: 'setProperty', payload: { SummaryListLoading: true }})
            const data = yield call(searchSummaryList, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        searchSummaryList: data.data,
                        SummaryTotal:data.pagination.rows_found
                    }
                })
            }
            yield put({ type: 'setProperty', payload: { SummaryListLoading: false }})
        },    
        // 积分明细
        * searchPointsList({payload, callback}, {select, call, put}) {
            yield put({ type: 'setProperty', payload: { PointsListLoading: true }})
            const data = yield call(searchPointsList, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        searchPointsList: data.data,
                        PointsListTotal:data.pagination.rows_found
                    }
                })
            }
            yield put({ type: 'setProperty', payload: { PointsListLoading: false }})
        },
        * getsettingData({payload, callback}, {select, call, put}) {
            // yield put({ type: 'setProperty', payload: { getsettingDataLoading: true }})
            const data = yield call(getsettingData, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        getsettingData: data.data
                    }
                })
            }
            callback && callback(data)
            // yield put({ type: 'setProperty', payload: { getsettingDataLoading: false }})
        },
        * pointsListDetail({payload, callback}, {select, call, put}) {
            yield put({ type: 'setProperty', payload: { pointDetailLoading: true }})
            const data = yield call(pointsListDetail, payload)
            if(data.data) {            
                yield put({
                    type: 'setProperty',
                    payload: {
                        pointsListDetail: data.data,
                        pointsListDetailTotal:data.pagination.rows_found
                    }
                })
            }
            yield put({ type: 'setProperty', payload: { pointDetailLoading: false }})
        },
        // 授权店铺
        * getAuthshops({payload, callback}, {select, call, put}) {
            const data = yield call(getAuthshops, payload)
            if(data.data) {
                let arr = []
                //type值类型 1:虎赞小店 ， 2：淘宝， 3：天猫，4：门店，5：京东，6：有赞，7：自营，8：阿里1688，9：微商小店，99所有平台的数据
                arr = data.data.filter(v=> v.type === 1 || v.type === 2 || v.type ===3 || v.type === 5 || v.type === 6  || v.type === 7|| v.type === 9)
                yield put({
                    type: 'setProperty',
                    payload: {
                        getAuthshops: arr,
                    }
                })
            }
            callback && callback(data)
        },
        // 公众号列表updateSetting
        * getGzhList({payload, callback}, {select, call, put}) {
            const data = yield call(getGzhList, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        getGzhList: data.data,
                    }
                })
            }
            callback && callback(data)
        },
        * updateSetting({payload, callback}, {select, call, put}) {
            const data = yield call(updateSetting, payload.settingForm)
            callback && callback(data)
        },
        * exportReport({payload, callback}, {select, call, put}) {
            yield put({ type: 'setProperty', payload: { exportReportLoading: true }})
            const data = yield call(exportReport, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty'
                })   
            }
            callback && callback(data)
            yield put({ type: 'setProperty', payload: { exportReportLoading: false }})
        },
        // 兑换订单
        * getExchangeList({payload, callback}, {select, call, put}) {
            const data = yield call(getExchangeList, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        exchangeList: data.data,
                        exchangeListTotal: data.pagination.rows_found
                    }
                })
            }
            callback && callback(data)
        },
        * exportOrder({payload, callback}, {select, call, put}) {
            const data = yield call(exportOrder, payload)
            if(data){
                callback && callback(data)
            }
        },
        * deliverGoods({payload, callback}, {select, call, put}) {
            const data = yield call(deliverGoods, payload)
            if(data&&data.meta&&data.meta.code ===200){
                callback && callback(data)
            }
        },
        // 商城
        * getMallList({payload, callback}, {select, call, put}){
            const data = yield call(getMallList, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        getMallList: data.data || [],
                        getMallListTotal: data.pagination.rows_found || 0
                    }
                })
            }
            callback && callback(data)
        },
        * getMallDetail({payload, callback}, {select, call, put}){
            const data = yield call(getMallDetail, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        getMallDetail: data.data
                    }
                })
            }
            callback && callback(data)
        },
        * editMall({payload, callback}, {select, call, put}){
            const data = yield call(editMall, payload)
            if(data.data) {                
                callback && callback(data)
            }
        },
        // 奖品
        * getAwardList({payload, callback}, {select, call, put}){
            const data = yield call(getAwardList, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        getGoodsList: data.data,
                        goodsListTotal: data.pagination.rows_found
                    }
                })
            }
            callback && callback(data)
        },
        * toggleAward({payload, callback}, {select, call, put}){
            const data = yield call(toggleAward, payload)
            if(data.data) {                
                callback && callback(data)
            }
        },
        * deleteAward({payload, callback}, {select, call, put}){
            const data = yield call(deleteAward, payload)
            if(data.data) {                
                callback && callback(data)
            }
        },
        * getAwardDetail({payload, callback}, {select, call, put}){
            const data = yield call(getAwardDetail, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        getAwardDetail: data.data
                    }
                })
            }
            callback && callback(data)
        },
        * editAward({payload, callback}, {select, call, put}){
            const data = yield call(editAward, payload)
            if(data.data) {                
                callback && callback(data)
            }
        },
        * getExpressList({payload, callback}, {select, call, put}){
            const {data} = yield call(getExpressList, payload)
            if(data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        express: data
                    }
                })
            }
            callback && callback(data)
        },
        *getToken({payload, callback},{call, put}){
            const data = yield call(getToken, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        photoToken: data.data.token
                    },
                })
                callback && callback(data)
            }
        },
        
        *changeIntegral({payload, callback},{call, put}){
            const data = yield call(changeIntegral, payload)
            callback && callback(data)
        },

    },
    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },

    },
}
