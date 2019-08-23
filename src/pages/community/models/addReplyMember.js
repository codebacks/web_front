import {parse} from 'qs'
import { queryAddReplyMember, setAddReplyMember } from "community/services/groupManagement"

const params = {
    limit: 10,
    offset: 0,
}

export default {
    namespace: 'community_groupManageAddReplyMember',
    state: {
        params: {
            ...params
        },
        list: [],
        total: 0,
        current: 1,
        activeRecord: null, // 回复者
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_groupManageAddReplyMember}) => community_groupManageAddReplyMember.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryAddReplyMember, parse(params), payload)
            if (data && data.data) {
                let activeRecord = null
                data.data.find((item) => {
                    if(!!item.is_replier) {
                        activeRecord = item
                        return true
                    }
                })
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page,
                        activeRecord: activeRecord,
                    }
                })
                callback && callback(data.data)
            }
        },
        * setAddReplyMember({payload, callback}, {select, call, put}) {
            console.log('payload:', payload)
            const data = yield call(setAddReplyMember, payload)
            if (data && data.meta?.code===200) {
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