import {list, batchRemove, removeAll} from 'wx/services/friends/zombie'

const params = {
    is_delete: 0,
    is_block: 1,
    limit: 10,
    offset: 0
}

export default {
    namespace: 'wx_friends_zombie',
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
            let params = yield select(({wx_friends_zombie}) => wx_friends_zombie.params)
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
        * batchRemove({payload, callback}, {select, call, put}) {
            const res = yield call(batchRemove, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback(res.meta.message)
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
