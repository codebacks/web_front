import {parse} from 'qs'
import { queryKickRecord, getKickReasonType } from "community/services/actionManage"

const params = {
    limit: 10,
    offset: 0,
    key: '',
    start_time: '',// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    end_time: '',// moment().format(DateFormat) + ' 23:59:59',
    reason: undefined,
}

export default {
    namespace: 'community_kickRecord',
    state: {
        params: {
            ...params
        },
        list: [],
        total: 0,
        current: 1,
        kickReasonsOptions: [],
    },
    subscriptions: {},
    effects: {

        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_kickRecord}) => community_kickRecord.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryKickRecord, parse(params))
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

        * getKickReasonType({payload, callback}, {select, call, put}) {
            const res = yield call(getKickReasonType)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        kickReasonsOptions: res.data,
                    }
                })
                callback && callback(res.data)
            }
        },

    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        resetParams(state, action) {
            return {...state, params}
        },
    }
}