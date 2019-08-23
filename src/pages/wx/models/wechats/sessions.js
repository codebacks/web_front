import {sessions, groupSessions} from 'wx/services/wechats'
import {parse} from 'qs'

const params = {
    query: '', // 搜索
    department_id: undefined, // 部门
    user_id: undefined, // 员工
    uin: undefined, // 微信号
    tag_id: '',
    limit: 10,
    offset: 0,
    wechat_status: '',
    is_stat: 1,
    is_no_reply: '', // 未回复
    order_by: '-conversation_time',
}

export default {
    namespace: 'wx_sessions',
    state: {
        params: {
            ...params
        },
        filter_type: '',
        sessionList: [],
        sessionTotal: 0,
        sessionCurrent: 1,
        groupSessionList: [],
        groupSessionTotal: 0,
        groupSessionCurrent: 1,
        activeSession: {}, // 选中的session对象，初始化默认和切换tab选中列表第一个，好友与群共用
        sessionLoading: false,
        isFriendTab: true, // 当前选中的tab

    },

    subscriptions: {},

    effects: {
        *query({payload, callback}, {select, call, put}) {
            yield put({type: 'showSessionLoading', payload: true})
            let {params, isFriendTab} = yield select(({wx_sessions}) => wx_sessions) //取当前 state
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(isFriendTab ? sessions: groupSessions, parse(params))
            if (res && res.data) {
                const data = res.data
                if(isFriendTab) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            sessionList: data,
                            params: params,
                            sessionTotal: res.pagination.rows_found,
                            sessionCurrent: payload.page === undefined ? 1 : payload.page
                        }
                    })
                } else {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            groupSessionList: data,
                            params: params,
                            groupSessionTotal: res.pagination.rows_found,
                            groupSessionCurrent: payload.page === undefined ? 1 : payload.page
                        }
                    })
                }
                callback && callback({data: data, isFriend: isFriendTab})
            }
            yield put({type: 'hideSessionLoading', payload: false})
        },
    },

    reducers: {
        showLoading(state) {
            return {...state, loading: true}
        },
        hideLoading(state) {
            return {...state, loading: false}
        },
        showSessionLoading(state) {
            return {...state, sessionLoading: true}
        },
        hideSessionLoading(state) {
            return {...state, sessionLoading: false}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, sessionLoading: false}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload}
            return {...state, ...{params: params}}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params}
        }
    }
}