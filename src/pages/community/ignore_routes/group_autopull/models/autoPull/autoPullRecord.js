import {parse} from 'qs'
import { queryAutoPullRecord, autoPullRecordStatistics } from "community/services/autoPull"

const params = {
    limit: 10,
    offset: 0,
    query: undefined,
    status: undefined, // 0否，1是
    task_type: undefined, // 0好友加群，1暗号加群
    execute_time_start: undefined,// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    execute_time_end: undefined,// moment().format(DateFormat) + ' 23:59:59',
}

export default {
    namespace: 'community_autoPullRecord',
    state: {
        params: {
            ...params
        },
        list: [],
        total: 0,
        current: 1,
        statistics: null,
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_autoPullRecord}) => community_autoPullRecord.params)
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(queryAutoPullRecord, parse(params))
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(res.data)
            }
        },
        * autoPullRecordStatistics({payload, callback}, {select, call, put}) {
            const res = yield call(autoPullRecordStatistics)
            if (res && res?.meta?.code === 200) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        statistics: res.data,
                    }
                })
                callback && callback(res.data)
            }
        }
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetAutoPullParams(state, action) {
            return {...state, params}
        }
    }
}