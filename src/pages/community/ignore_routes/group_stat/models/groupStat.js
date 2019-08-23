import moment from 'moment'
import {queryGroupStat, exportTask, exportExcel} from 'community/services/groupStat'
import config from "community/common/config"
const {DateFormat} = config

function getInitParams() {
    return {
        limit: 1000,
        offset: 0,
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
    namespace: 'community_group_stat',
    state: {
        params: getInitParams(),
        list: [],
        original: [],
        loading: false,
        range: 'week',
        searchParams: {},
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_group_stat}) => community_group_stat.params)
            params = {...params, ...payload.params}
            const data = yield call(queryGroupStat, params)
            if (data && data.data) {
                let res = data.data
                let arr = [], day
                res.forEach((item) => {
                    day = ('' + item.day).substr(4, 4)
                    arr.push({
                        '时间': day,
                        '数量': item.new_chatroom_count,
                        '类型': '群净增'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.chatroom_count,
                        '类型': '群总数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.new_member_count,
                        '类型': '群成员净增'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.member_count,
                        '类型': '群成员总数'
                    })
                    // arr.push({
                    //     '时间': day,
                    //     '数量': item.u_member_count,
                    //     '类型': '群成员去重总数'
                    // })
                })
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: arr,
                        original: res,
                        params: params,
                        searchParams: params
                    }
                })
            }
        },
        * exportTask({payload, callback}, {select, call, put}) {
            const res = yield call(exportTask, payload)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * exportExcel({payload, callback}, {select, call, put}) {
            const res = yield call(exportExcel, payload)
            callback && callback(res)
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
            return {...state, params: getInitParams()}
        },
        resetRange(state, action) {
            return {...state, ...{range: 'week'}}
        },
    }
}
