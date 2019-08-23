/*
 * @Author: sunlzhi 
 * @Date: 2018-10-16 15:10:18 
 * @Last Modified by: zhousong
 * @Last Modified time: 2019-2-28
 */

import { getToken } from 'setting/services/shops'
import { goodsList, goodsBatch, batchRecommend, batchDelete, commissionUpdate, centerList, getPlatformShops, getCategory, goodsBatchImport, updateVirtualSales } from 'mall/services/goods_management'
export default {
    namespace: 'goods_management',
    state: {
        goodsList: [],
        count: '',
        loading: false,
        orderList: [],
        totalCount: 0,
        platformShops: [],
        total: 0,
        categoryList: [],
        photoPrefix: null,
        token: null
    },

    effects: {
        // 商品列表
        *goodsList({ payload, callback }, { call, put }) {
            yield put({ type: 'setProperty', payload: { loading: true } })
            const response = yield call(goodsList, payload)
            const data = yield response.json()
            const totalCount = response.headers.get('row_count')
            if (response) {
                yield put({ type: 'setProperty', payload: { goodsList: data, totalCount: Number(totalCount) } })
                callback && callback()
            }
            yield put({ type: 'setProperty', payload: { loading: false } })
        },
        *goodsBatch({ payload, callback }, { call, put }) {
            const data = yield call(goodsBatch, payload)
            if (data) {
                callback && callback(data)
            }
        },
        *batchRecommend({ payload, callback }, { call, put }) {
            const data = yield call(batchRecommend, payload)
            if (data) {
                callback && callback(data)
            }
        },
        *batchDelete({ payload, callback }, { call, put }) {
            const data = yield call(batchDelete, payload)
            if (data) {
                callback && callback(data)
            }
        },
        *commissionUpdate({ payload, callback }, { call, put }) {
            yield put({ type: 'setProperty' })
            const response = yield call(commissionUpdate, payload.data)
            if (response) {
                callback && callback(response)
            }
        },
        *centerList({ payload, callback }, { select, call, put }) {
            const { data } = yield call(centerList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        centerList: data,
                    },
                })
            }
            callback && callback(data)
        },
        *getPlatformShops({ payload, callback }, { select, call, put }) {
            const data = yield call(getPlatformShops, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        platformShops: data.data
                    }
                })
            }
            callback && callback(data)
        },

        // 商品批量导入
        *getToken({payload, callback},{call, put}){
            const data = yield call(getToken, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        photoToken: data.data.token,
                        photoPrefix: data.data.prefix,
                    },
                })
            }
        },
        *updateVirtualSales({ payload, callback }, { select, call, put }) {
            const data = yield call(updateVirtualSales, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                })
                callback && callback(data)
            }
        },
        *getCategory({ payload, callback }, { select, call, put }) {
            const data = yield call(getCategory, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        categoryList: data.list,
                        total: data.total
                    }
                })
            }
            callback && callback(data)
        },
        *goodsBatchImport({ payload, callback }, { select, call, put }) {
            const data = yield call(goodsBatchImport, payload)
            if (data.status === 200) {
                yield put({
                    type: 'setProperty',
                })
                callback && callback(data)
            }
        },
    },

    reducers: {
        setParams(state, action) {
            let params = { ...state.params, ...action.payload.params }
            return { ...state, params }
        },
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
