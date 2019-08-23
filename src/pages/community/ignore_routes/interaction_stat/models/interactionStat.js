import {parse} from 'qs'
import config from "community/common/config"
import moment from 'moment'
import {queryInteractionStat} from "community/services/interactionStat"

const {DateFormat} = config

function getInitParams() {
    return {
        // start_time: moment().subtract(6, 'days').format(DateFormat) + ' 00:00:00',
        // end_time: moment().format(DateFormat) + ' 23:59:59',
        start_time: moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
        end_time: moment().subtract(1, 'days').format(DateFormat) + ' 23:59:59',
        department_id: undefined,
        user_id: undefined,
        uin: undefined,
    }
}

export default {
    namespace: 'community_interaction_stat',
    state: {
        params: getInitParams(),
        list: [],
        original: [],
        loading: false,
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let params = yield select(({community_interaction_stat}) => community_interaction_stat.params)
            params = {...params, ...payload.params}
            const data = yield call(queryInteractionStat, parse({...params}))
            if (data && data.data) {
                let res = data.data
                let arr = [], day
                res.forEach((item) => {
                    day = ('' + item.day).substr(4, 4)
                    arr.push({
                        '时间': day,
                        '数量': item.talk_count,
                        '类型': '群消息数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.talk_member_count,
                        '类型': '群发言人数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.chatroom_talk_count_avg,
                        '类型': '群平均消息数'
                    })
                    arr.push({
                        '时间': day,
                        '百分比': item.chatroom_talk_ratio,
                        '类型': '群发言比例'
                    })
                })
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: arr,
                        original: res,
                        params: params,
                    }
                })
            }
            yield put({type: 'hideLoading'})
        },
    },

    reducers: {
        showLoading(state) {
            return {...state, loading: true}
        },
        hideLoading(state) {
            return {...state, loading: false}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        }
    }
}