/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/17
*/
import {parse} from 'qs'
import { queryViolationRecord, joinWhiteList, sendWarning, kickoutGroup } from "community/services/actionManage"

const params = {
    limit: 10,
    offset: 0,
    violator: undefined,
    chatroom_name: undefined,
    chatroom_owner: undefined,
    start_time: '',// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    end_time: '',// moment().format(DateFormat) + ' 23:59:59',
    type: undefined,
    status: undefined,
}

export default {
    namespace: 'community_violationRecords',
    state: {
        params: {
            ...params
        },
        list: [],
        total: 0,
        current: 1,
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_violationRecords}) => community_violationRecords.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryViolationRecord, parse(params))
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
        * joinWhiteList({payload, callback}, {select, call, put}) {
            const data = yield call(joinWhiteList, payload)
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
        * sendWarning({payload, callback}, {select, call, put}) {
            const data = yield call(sendWarning, payload)
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
        * kickoutGroup({payload, callback}, {select, call, put}) {
            const data = yield call(kickoutGroup, payload)
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
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