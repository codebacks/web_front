import moment from 'moment'
import {parse} from 'qs'
import config from 'data/common/config'
import {queryWorkload} from 'data/services/stats/friends'
import {exportExcel, exportTask} from 'data/services/stats/friends'

const {DateFormat} = config

function getInitParams() {
    return {
        department_id: undefined,
        user_id: undefined,
        uin: undefined,
        start_time: moment().subtract(6, 'days').format(DateFormat) + ' 00:00:00',
        end_time: moment().format(DateFormat) + ' 23:59:59',
        group_by_date: true
    }
}

export default {
    namespace: 'data_stat_friends',
    state: {
        list: [],
        total: {
            new_friend_count: 0,
        },
        params: getInitParams(),
        original: [],
    },

    subscriptions: {},

    effects: {
        * query({payload}, {select, call, put}) {
            let params = yield select(({data_stat_friends}) => data_stat_friends.params)
            params = {...params, ...payload.params}
            params.group_by_date = 1
            const data = yield call(queryWorkload, parse({params: params}))
            if (data && data.data) {
                let res = data.data
                let arr = [], day, detailTotal = {
                    new_friend_count: 0,
                }
                let lastTotal = 0
                res.forEach((item) => {
                    day = ('' + item.day).substr(4, 4)
                    detailTotal.new_friend_count += item.new_friend_count
                    lastTotal = lastTotal + item.new_friend_count
                    item.total = lastTotal
                    arr.push({
                        '时间': day,
                        '数量': item.new_friend_count,
                        '类型': '净增(人)'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.block_friend_count,
                        '类型': '被删除(人)'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.delete_friend_count,
                        '类型': '删除(人)'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.friend_count,
                        '类型': '总数(人)'
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
