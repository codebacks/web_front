import { addActivity, setActivity } from 'community/services/groupCode'
import {parse} from "qs"
import _ from 'lodash'

const _state = {
    title: '',
    remark: '',
}
export default {
    namespace: 'community_groupCodeAddActivity',

    state: {
        ..._state
    },

    effects: {
        * add({payload, callback}, {select, call, put}) {
            let state = yield select(({community_groupCodeAddActivity}) => community_groupCodeAddActivity)
            const data = yield call(addActivity, { body: {...state} })
            if (data && data.meta?.code === 200) {
                callback && callback(data.data)
            }
        },
        * set({payload, callback}, {select, call, put}) {
            let state = yield select(({community_groupCodeAddActivity}) => community_groupCodeAddActivity)
            const data = yield call(setActivity, { id: payload.id, body: {...state} })
            if (data && data.meta?.code === 200) {
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetState(state, action) {
            return {...state, ..._state}
        },
    },
}
