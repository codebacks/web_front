import {queryGroupDist} from 'community/services/groupStat'

const params = {
    department_id: undefined,
    user_id: undefined,
    uin: undefined,
}

export default {
    namespace: 'community_group_dist',
    state: {
        params: {
            ...params
        },
        list: [],
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_group_dist}) => community_group_dist.params)
            params = {...params, ...payload.params}
            const data = yield call(queryGroupDist, params)
            if (data && data.data) {
                callback && callback(data.data)
            }
        },

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