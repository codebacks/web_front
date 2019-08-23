import {queryHistory} from 'wx/services/wechats'

const params = {
    limit: 10,
    offset: 0,
    content: undefined,
    department_id: undefined,
    user_id: undefined,
    uin: undefined,
    start_time: undefined,
    end_time: undefined,
}

export default {
    namespace: 'wx_history',
    state: {
        list: [],
        params: {
            ...params
        },
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({wx_history}) => wx_history.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryHistory, params)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        loading: false,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params}
        }
    }
}
