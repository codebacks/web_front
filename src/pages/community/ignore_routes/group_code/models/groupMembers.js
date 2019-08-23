import { queryMembersList, getGroupMemberExtra } from 'community/services/groupCode'
import {parse} from "qs"
import _ from 'lodash'

export default {
    namespace: 'community_groupCodeGroupMembers',

    state: {
        list: [],
        extra: null,
    },

    effects: {
        * query({payload, callback}, {select, call, put}) {
            const data = yield call(queryMembersList, payload) // payload: {group_activity_id: '', row_id: ''}
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                    }
                })
                callback && callback(data.data)
            }
        },
        * getGroupMemberExtra({payload, callback}, {select, call, put}) {
            const data = yield call(getGroupMemberExtra, payload) // payload: {group_activity_id: '', row_id: ''}
            if (data && data.meta?.code===200) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        extra: data.data,
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
    },
}
