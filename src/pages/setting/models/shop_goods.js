
import { getGoodsList, updateGoods, getShopListOauth ,getImportList,importGoods} from 'setting/services/shopGoods'
export default {
    namespace: 'setting_shop_goods',
    state: {
        list: [],
        totalCount: 0,
        shops: [],
        importGoodsList:[],
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

        *updateGoods({ payload, callback }, { call, put }) {
            const data = yield call(updateGoods, payload)
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
                        shops: data.data || [],
                    }
                })
            }
        },
        *getImportList({ payload, callback }, { call, put }) {
            const data = yield call(getImportList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        importGoodsList: data.data
                    }
                })
                
            }
            callback && callback(data)
        },
        *importGoods({ payload, callback }, { call, put }) {
            const data = yield call(importGoods, payload)
            if(data){
                callback && callback(data)
            }
        },
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
