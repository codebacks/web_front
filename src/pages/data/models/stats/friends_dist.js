import {parse} from 'qs'
import {queryBaseDist, queryAreaDist} from 'data/services/stats/friends'

const params = {
    department_id: undefined,
    user_id: undefined,
    uin: undefined,
}

export default {
    namespace: 'data_stat_friends_dist',
    state: {
        loading: false,
        params: {
            ...params
        },
        base: {},
        area: {}
    },

    subscriptions: {},

    effects: {
        * queryBaseDist({payload, callback}, {select, call, put}) {
            let params = yield select(({data_stat_friends_dist}) => data_stat_friends_dist.params)
            params = {...params, ...payload.params}
            const data = yield call(queryBaseDist, parse({params: params}))
            if (data && data.data) {
                callback && callback(data.data)
            }
        },
        * queryAreaDist({payload, callback}, {select, call, put}) {
            let params = yield select(({data_stat_friends_dist}) => data_stat_friends_dist.params)
            params = {...params, ...payload.params}
            const data = yield call(queryAreaDist, parse({params: params}))
            if (data && data.data) {
                callback && callback(data.data)
            }
        }
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params}
        }
    }
}
