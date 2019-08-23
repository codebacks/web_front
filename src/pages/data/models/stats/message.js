import moment from 'moment'
import {queryWorkload, exportExcel, exportTask} from 'data/services/stats'

import config from 'data/common/config'

const {DateFormat} = config

function getInitParams() {
    return {
        department_id: undefined,
        user_id: undefined,
        uin: undefined,
        start_time: moment().subtract(6, 'days').format(DateFormat) + ' 00:00:00',
        end_time: moment().format(DateFormat) + ' 23:59:59',
    }
}

export default {
    namespace: 'data_stat_message',
    state: {
        list: [],
        total: {
            receive_count: 0,
            send_count: 0,
            send_friend_count: 0,
            receive_friend_count: 0
        },
        params: getInitParams(),
        searchParams: {},
    },

    subscriptions: {},

    effects: {
        * query({payload}, {select, call, put}) {
            let params = yield select(({data_stat_message}) => data_stat_message.params)
            params = {...params, ...payload.params}
            params.group_by_date = 1
            const data = yield call(queryWorkload,{params: params})
            if (data && data.data) {
                let res = data.data
                let arr = [], day, detailTotal = {
                    receive_count: 0,
                    send_count: 0,
                    send_friend_count: 0,
                    receive_friend_count: 0
                }
                res.forEach((item) => {
                    day = ('' + item.day).substr(4, 4)
                    day = `${day.substring(0, 2)}/${day.substring(2, 4)}`
                    detailTotal.receive_count += item.receive_count
                    detailTotal.send_count += item.send_count
                    detailTotal.send_friend_count += item.send_friend_count
                    detailTotal.receive_friend_count += item.receive_friend_count
                    arr.push({
                        '时间': day,
                        '数量': item.receive_count,
                        '类型': '接收消息数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.send_count,
                        '类型': '发送消息数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.send_friend_count,
                        '类型': '发送人数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.receive_friend_count,
                        '类型': '接收人数'
                    })
                })
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: arr,
                        original: res,
                        params: params,
                        searchParams: params,
                        total: detailTotal
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
        }
    }
}
