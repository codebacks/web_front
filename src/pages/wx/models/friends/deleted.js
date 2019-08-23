import {list} from 'wx/services/friends/deleted'

const params = {
    department_id: undefined,
    user_id: undefined,
    uin: undefined,
    operator: undefined,
    reason: undefined, //  1：重复好友， 2：智能清粉（僵尸好友）  3：牛客服手动删除  4：未知
    query: '',
    start_time: '',
    end_time: '',
    limit: 10,
    offset: 0
}

export default {
    namespace: 'wx_friends_deleted',
    state: {
        list: [],
        params: {
            ...params
        },
        total: 0,
        current: 1,
    },

    subscriptions: {
    },

    effects: {
        * list({payload, callback}, {select, call, put}) {
            let params = yield select(({wx_friends_deleted}) => wx_friends_deleted.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(list, params)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1
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
