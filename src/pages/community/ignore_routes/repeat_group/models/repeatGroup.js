import {parse} from 'qs'
import { query, queryStatistics, whitelistAdd, queryRepeatGroup, clearRepeatGroup, addBlackList } from "community/services/repeatGroup"
import moment from "moment/moment"

const params = {
    limit: 10,
    offset: 0,
    key: '',
    // minNum: 2,
    // maxNum: 10,
}

export default {
    namespace: 'community_repeatGroup',
    state: {
        params: {
            ...params
        },
        list: [],
        total: 0,
        current: 1,
        statistics: null, // 重复群列表统计数据,
        clearModalList: [], // 重复群详情清理列表
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_repeatGroup}) => community_repeatGroup.params)
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
        * queryStatistics({payload, callback}, {select, call, put}) {
            const data = yield call(queryStatistics)
            if (data && data.meta?.code === 200) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        statistics: data.data,
                    }
                })
                callback && callback(data.data)
            }
        },
        * queryRepeatGroup({payload, callback}, {select, call, put}) {
            const data = yield call(queryRepeatGroup, payload) // wx_id
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        clearModalList: data.data,
                    }
                })
                callback && callback(data.data)
            }
        },
        * whitelistAdd({payload, callback}, {select, call, put}) {
            const data = yield call(whitelistAdd, payload) // body={wechat_id: '', remark:''}
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
        * clearRepeatGroup({payload, callback}, {select, call, put}) {
            const data = yield call(clearRepeatGroup, payload) // wx_id, body={chatroom_names: ''}群列表，已逗号隔开
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