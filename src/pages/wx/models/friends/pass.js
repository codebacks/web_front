import {list} from 'wx/services/friends/pass'

const params = {
    query: '',
    department_id: undefined,
    user_id: undefined,
    uin: undefined,
    start_time: '',
    end_time: '',
    status: {
        is_passed: undefined, // 已通过
        is_ignored: undefined, // 已忽略
        not_passed: undefined, //  未通过
        not_handled: undefined, // 未处理
        expired: undefined, // 已过期
        is_deleted: undefined, // 已删除
    },
    limit: 10,
    offset: 0
}

export default {
    namespace: 'wx_friends_pass',
    state: {
        list: [],
        params: {
            ...params
        },
        checkedAll: false,
        total: 0,
        current: 1,
    },

    subscriptions: {},

    effects: {
        * list({payload, callback}, {select, call, put}) {
            let params = yield select(({wx_friends_pass}) => wx_friends_pass.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            let query = {...params, ...params.status}
            delete query.status
            const res = yield call(list, query)
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
        }
    }
}
