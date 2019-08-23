import {list, friendsDetail, addWhitelist, tag, remove} from 'wx/services/friends/duplication'

const params = {
    query: undefined,
    repeat_times: '',
    limit: 10,
    offset: 0
}

export default {
    namespace: 'wx_friends_duplication',
    state: {
        list: [],
        params: {
            ...params
        },
        total: 0,
        current: 1,
        friendsDetail: {}
    },

    subscriptions: {
    },

    effects: {
        * list({payload, callback}, {select, call, put}) {
            let params = yield select(({wx_friends_duplication}) => wx_friends_duplication.params)
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
        * friendsDetail({payload, callback}, {select, call, put}) {
            const res = yield call(friendsDetail, payload)
            if (res && res.data) {
                let friendsDetail = yield select(({wx_friends_duplication}) => wx_friends_duplication.friendsDetail)
                friendsDetail[payload.username] = res.data
                yield put({
                    type: 'setProperty',
                    payload: {
                        friendsDetail: friendsDetail
                    }
                })
                callback && callback(res.data)
            }
        },
        * addWhitelist({payload, callback}, {select, call, put}) {
            const res = yield call(addWhitelist, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * tag({payload, callback}, {select, call, put}) {
            const res = yield call(tag, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * remove({payload, callback}, {select, call, put}) {
            const res = yield call(remove, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback(res.meta.message)
            }
        }
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
