import moment from 'moment'
import { queryActivityGroupStat } from 'community/services/groupCode'
import config from "community/common/config"
const {DateFormat} = config

const params = {
    start_time: moment().subtract(6, 'days').format(DateFormat) + ' 00:00:00',
    end_time: moment().format(DateFormat) + ' 23:59:59',
}

export default {
    namespace: 'community_groupCodeActivityGroupStat',
    state: {
        params: {
            ...params
        },
        original: [],
        chatroom: null,
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            const data = yield call(queryActivityGroupStat, payload)
            if (data && data.data.datas) {
                let res = data.data
                yield put({
                    type: 'setProperty',
                    payload: {
                        original: res.datas,
                        chatroom: res.chatroom,
                    }
                })
                callback && callback(res.datas)
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