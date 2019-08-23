import { 
    getGoodsList, 
    getShopListOauth, 
    getLinkList, 
    oneClickSetAll, 
    setWetoTao, 
    goodsDeleteWe, 
    deleteWe,

    getsendDatalist,
    getGoodItemInfo,
    getGoodsrecommendInfo,
} from '../services/wechat_convers'
export default {
    namespace: 'platform_wechat_convers',
    state: {
        list: [],
        linkList: [],
        totalCount: 0,
        count: 0,
        shops: [],
        sendDatalist:[],
        totalsendDatalist:0,



        GoodItemInfo:{},
        GoodsrecommendInfo:[]
    },
    effects: {
        *getGoodsList({ payload, callback }, { call, put }) {
            const data = yield call(getGoodsList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        totalCount: data.pagination.rows_found
                    }
                })
                callback && callback(data.data)
            }
        },
        *getLinkList({ payload, callback }, { call, put }) {
            const data = yield call(getLinkList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        linkList: data.data,
                        count: data.pagination.rows_found
                    }
                })
                callback && callback(data.data)
            }
        },
        *oneClickSetAll({ payload, callback }, { call, put }) {
            const data = yield call(oneClickSetAll, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                })
                callback && callback(data)
            }
        },
        *goodsDeleteWe({ payload, callback }, { call, put }) {
            const data = yield call(goodsDeleteWe, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                })
                callback && callback(data)
            }
        },
        *deleteWe({ payload, callback }, { call, put }) {
            const data = yield call(deleteWe, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                })
                callback && callback(data)
            }
        },
        *setWetoTao({ payload, callback }, { call, put }) {
            const data = yield call(setWetoTao, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                })
                callback && callback(data)
            }
        },
        //获取权限店铺列表
        *getShopListOauth({ payload, callback }, { call, put }) {
            const data = yield call(getShopListOauth, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        shops: data.data,
                    }
                })
            }
        },
        //获取发送记录
        *getsendDatalist({payload,callback},{call,put}){
            const data = yield call(getsendDatalist, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        sendDatalist: data.data,
                        totalsendDatalist: data.pagination.rows_found
                    }
                })
            }
            callback && callback(data)
        },



        *getGoodItemInfo({payload,callback},{call,put}){
            const data = yield call(getGoodItemInfo, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        GoodItemInfo: data.data,                       
                    }
                })
            }
            callback && callback()
        },
        *getGoodsrecommendInfo({payload,callback},{call,put}){
            const data = yield call(getGoodsrecommendInfo, payload)
            if (data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        GoodsrecommendInfo: data.data,                       
                    }
                })
            }
            callback && callback(data)
        }

    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
