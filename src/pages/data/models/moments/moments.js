import {parse} from 'qs'
import {momentsStat, momentsStatByDate, momentsSummary, exportExcel, exportTask} from 'data/services/moments/moments'
import config from "data/common/config"
import moment from 'moment'

const {DateFormat} = config

function getInitParams() {
    return {
        department_id: undefined,
        user_id: undefined,
        uin: undefined,
        start_time: moment().subtract(6, 'days').format(DateFormat) + ' 00:00:00',
        end_time: moment().format(DateFormat) + ' 23:59:59',
        limit: 10,
        offset: 0,
    }
}

export default {
    namespace: 'data_stat_moments',
    state: {
        params: getInitParams(),
        list: [],
        line: [],
        current: 1,
        total: 0,
        loading: false,
        summary: [],
        range: 'week',
        searchParams: {},
    },
    subscriptions: {},
    effects: {
        * momentsStat({payload, callback}, {select, call, put}) {
            let params = yield select(({data_stat_moments}) => data_stat_moments.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(momentsStat, parse({...params}))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        searchParams: params,
                        total: data.pagination.rows_found,
                        current: parseInt(data.pagination.offset / data.pagination.limit, 10) + 1
                    }
                })
            }
        },

        * momentsStatByDate({payload, callback}, {select, call, put}) {
            const data = yield call(momentsStatByDate, parse(payload))
            if (data && data.data) {
                let res = data.data
                let arr = []
                let day
                res.forEach((item) => {
                    day = moment(item.date).format('MM/DD')
                    arr.push({
                        '时间': day,
                        '数量': item.moments,
                        '类型': '发圈数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.likes,
                        '类型': '点赞数'
                    })
                    arr.push({
                        '时间': day,
                        '数量': item.comments,
                        '类型': '评论数'
                    })
                })

                yield put({
                    type: 'setProperty',
                    payload: {
                        line: arr,
                    }
                })
            }
        },

        * momentsSummary({payload, callback}, {select, call, put}) {
            const data = yield call(momentsSummary, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        summary: data.data,
                    },
                })
                callback && callback(data.data)
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