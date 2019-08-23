import {queryWorkload} from 'crm/services/stats'
import moment from 'moment'
import config from 'crm/common/config'
import {parse} from 'qs'

const {DateFormat} = config

export default {
    namespace: 'crm_stat_workload',
    state: {
        list: [],
        detailList: [],
        detailTotal: {
            new_friend_count: 0,
            receive_count: 0,
            send_count: 0,
            send_friend_count: 0,
            receive_friend_count: 0
        },
        params: {
            user_id: '',
            start_time: moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
            end_time: moment().format(DateFormat) + ' 23:59:59',
        },
        loading: false,
        loadingDetail: false
    },

    subscriptions: {},

    effects: {
        *query({payload}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let params = yield select(({crm_stat_workload}) => crm_stat_workload.params) //取当前 state
            params = {...params, ...payload.params}
            params.group_by_date = ''
            const data = yield call(queryWorkload, parse({params: params}))
            if (data && data.data) {
                let list = data.data.sort((a, b)=> {
                    return a.send_friend_count < b.send_friend_count
                })
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: list,
                        params: params
                    }
                })
            } else {
                yield put({type: 'hideLoading'})
            }
        },
        *queryDetail({payload}, {select, call, put}) {
            yield put({type: 'showDetailLoading'})
            let params = yield select(({crm_stat_workload}) => crm_stat_workload.params) //取当前 state
            params = {...params, ...payload.params}
            params.group_by_date = 1
            const data = yield call(queryWorkload, parse({params: params}))
            if (data && data.data ) {
                let res = data.data
                let arr = [], day, detailTotal = {
                    new_friend_count: 0,
                    receive_count: 0,
                    send_count: 0,
                    send_friend_count: 0,
                    receive_friend_count: 0
                }
                res.forEach((item)=> {
                    day = ('' + item.day).substr(4, 4)
                    detailTotal.new_friend_count += item.new_friend_count
                    detailTotal.receive_count += item.receive_count
                    detailTotal.send_count += item.send_count
                    detailTotal.send_friend_count += item.send_friend_count
                    detailTotal.receive_friend_count += item.receive_friend_count
                    arr.push({
                        '时间': day,
                        '数量': item.new_friend_count,
                        '类型': '新增人数'
                    })
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
                        '类型': '回复人数'
                    })
                })
                yield put({
                    type: 'querySuccess',
                    payload: {
                        detailList: arr,
                        params: params,
                        detailTotal: detailTotal
                    }
                })
            } else {
                yield put({type: 'hideDetailLoading'})
            }
        },
    },

    reducers: {
        showDetailLoading(state) {
            return {...state, loadingDetail: true}
        },
        hideDetailLoading(state) {
            return {...state, loadingDetail: false}
        },
        showLoading(state) {
            return {...state, loading: true}
        },
        hideLoading(state) {
            return {...state, loading: false}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false, loadingDetail: false}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        }

    }
}
