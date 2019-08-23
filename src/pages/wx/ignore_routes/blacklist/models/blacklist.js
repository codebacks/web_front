/**
 * @Description 黑名单
 * @author XuMengPeng
 * @date 2018/12/13
 */
import {parse} from 'qs'
import { blacklistList, blacklistRemove, addBlackList } from "wx/services/whitelist"
import moment from "moment/moment"

const params = {
    limit: 10,
    offset: 0,
    key: '',
    start_time: '',// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    end_time: '',// moment().format(DateFormat) + ' 23:59:59',
}

export default {
    namespace: 'wx_blacklist',
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
            let params = yield select(({wx_blacklist}) => wx_blacklist.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(blacklistList, parse(params))
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
        * blacklistRemove({payload, callback}, {select, call, put}) {
            const data = yield call(blacklistRemove, payload) // payload.id
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
        * addBlackList({payload, callback}, {select, call, put}) {
            const data = yield call(addBlackList, payload)
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