/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/27
*/
import { query, update, add, deleteDivide } from 'wx/services/wechatDivide'
import {parse} from "qs"
import _ from 'lodash'

const params = {
    limit: 10,
    offset: 0,
}

export default {
    namespace: 'wx_wechatDivide',

    state: {
        params: {
            ...params,
        },
        list: [],
        total: 0,
        current: 1,
    },

    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({wx_wechatDivide}) => wx_wechatDivide.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(query, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            }
        },
        * update({payload, callback}, {select, call, put}) {
            const data = yield call(update, payload)
            if (data && data.meta?.code===200) {
                callback && callback()
            }
        },
        * add({payload, callback}, {select, call, put}) {
            const data = yield call(add, payload)
            if (data && data.meta?.code===200) {
                callback && callback()
            }
        },
        * deleteDivide({payload, callback}, {select, call, put}) {
            const data = yield call(deleteDivide, payload)
            if (data && data.meta?.code===200) {
                callback && callback()
            }
        },
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params}
        },
    },
}
