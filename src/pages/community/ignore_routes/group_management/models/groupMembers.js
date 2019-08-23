import {parse} from 'qs'
import { queryGroupMembers, setGroupMembersTasker } from "community/services/groupManagement"

const params = {
    limit: 10,
    offset: 0,
    query: '',
}

export default {
    namespace: 'community_groupMembers',
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
            let params = yield select(({community_groupMembers}) => community_groupMembers.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryGroupMembers, parse(params), payload)
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
        },
    }
}