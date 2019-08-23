import { drainageQuery, queryActivityTop, switchActivityStatus, qrSetting } from 'community/services/groupCode'
import {parse} from "qs"
import _ from 'lodash'

const params = {
    key: '',
    limit: 10,
    offset: 0,
    start_time: '',// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    end_time: '',// moment().format(DateFormat) + ' 23:59:59',
    order_by: '-create_at', // 排序字段，字段名，前面加-降序，不加升序，（默认创建时间降序）
}


export default {
    namespace: 'community_groupCode',

    state: {
        params: {
            ...params,
        },
        list: [],
        total: 0,
        current: 1,
        top: null,
        group_member_limit: '', // 单群人数设置
        group_qr_code_use_limit: '', // 扫码次数设置
    },

    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_groupCode}) => community_groupCode.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(drainageQuery, parse(params))
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
        * queryActivityTop({payload, callback}, {select, call, put}) {
            const data = yield call(queryActivityTop)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        top: data.data,
                    }
                })
                callback && callback(data.data)
            }
        },
        * switchActivityStatus({payload, callback}, {select, call, put}) {
            const data = yield call(switchActivityStatus, payload)
            if (data && data.meta?.code===200) {
                callback && callback()
            }
        },
        * qrSetting({payload, callback}, {select, call, put}) {
            const data = yield call(qrSetting, payload)
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
