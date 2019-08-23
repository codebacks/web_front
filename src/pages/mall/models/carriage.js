/**
 **@Description:
 **@author: 吴明
 */

import {
    tableList,
    checkPacket,
    shopList,
    carriageTemplateList,
    carriageTemplateDetail,
    increaseCarriageTemplate,
    updateCarriageTemplate,
    deleteCarriageTemplate,
    putPostageType
} from "mall/services/carriage"

export default {
    namespace: "mall_carriage",
    state: {
        data: [],
        carriage: [],
        ispacket: "",
        count: 1,
        loading: false,
        shopList: [],
        pageData:{}
    },

    effects: {
        // 获取红包列表
        *tableList({ payload, callback }, { call, put }) {
            yield put({ type: "setQuery", payload: { loading: true } })
            const response = yield call(tableList, payload)
            if (response.data) {
                yield put({
                    type: "setQuery",
                    payload: {
                        data: response.data,
                        count: response.pagination.rows_found
                    }
                })
                callback && callback()
            }
            yield put({ type: "setQuery", payload: { loading: false } })
        },
        // 是否开通小红包功能
        *checkPacket({ payload, callback }, { call, put }) {
            const response = yield call(checkPacket, payload)
            if (response.data) {
                yield put({
                    type: "setQuery",
                    payload: {
                        ispacket: response.data
                    }
                })
                callback && callback()
            }
        },
        // 店铺列表
        *shopList({ payload, callback }, { call, put }) {
            const response = yield call(shopList, payload)
            if (response.data) {
                yield put({
                    type: "setQuery",
                    payload: {
                        shopList: response.data
                    }
                })
                callback && callback()
            }
        },
        // 运费模板列表
        *carriageTemplateList({ payload, callback }, { call, put }) {
            const response = yield call(carriageTemplateList, payload)
            if( response.json){
                const data = yield response.json()
                const totalCount = response.headers.get('row_count')
                if (response) {
                    yield put({
                        type: "setQuery",
                        payload: {
                            count:+totalCount,
                            pageData: payload,
                            data
                        }
                    })
                    callback && callback(data)
                }
            }
            
        },
        // 运费模板详情
        *carriageTemplateDetail({ payload, callback }, { call, put }) {
            const response = yield call(carriageTemplateDetail, payload)
            if (response) {
                yield put({
                    type: "setQuery",
                    payload: {
                        carriage: response
                    }
                })
            }
        },
        // 新增运费模板
        *increaseCarriageTemplate({ payload, callback }, { call, put }) {
            const response = yield call(increaseCarriageTemplate, payload)
            callback && callback(response.success)
        },
        // 修改运费模板
        *updateCarriageTemplate({ payload, callback }, { call, put }) {
            const response = yield call(updateCarriageTemplate, payload)
            callback && callback(response.success)
        },
        // 删除运费模板
        *deleteCarriageTemplate({ payload, callback }, { call, put }) {
            const response = yield call(deleteCarriageTemplate, payload)
            callback && callback(response.success)
        },
        *putPostageType({ payload, callback }, { call, put }){
            const response = yield call(putPostageType, payload)
            if(response){
                callback && callback(response)
            }
        },
        *carriageTemplateClear({ payload, callback }, { call, put }){
            yield put({
                type: "setQuery",
                payload: {
                    carriage: {}
                }
            })
        }
    },

    reducers: {
        setQuery(state, action) {
            return {
                ...state,
                ...action.payload
            }
        }
    }
}
