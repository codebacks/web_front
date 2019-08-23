import {parse} from 'qs'
import moment from 'moment'
import config from "data/common/config"
import {query} from "data/services/business"

const {DateFormat} = config

export default {
    namespace: 'data_business_group_report',
    state: {
        dailyParams: {
            stat_time: moment().subtract(1, 'days').format(DateFormat) + ' 23:59:59',
            department_id: undefined,
        },
        monthParams: {
            stat_time: moment().endOf('month').format(DateFormat) + ' 23:59:59',
            department_id: undefined,
        },
        rankParams: {
            stat_time: moment().subtract(1, 'days').format(DateFormat) + ' 23:59:59',
            department_id: undefined,
        },
        params: {
            stat_type: 1, // 1-日报表，2-月报表 3-排行榜
        },
        hasLoadDaily: false,
        hasLoadMonth: false,
        hasLoadRank: false,
        loading: false,
        dayStat: [],
        monthStat: [],
        rankStat: [],
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let {params, dailyParams, monthParams, rankParams} = yield select(((state) => state.data_business_group_report))
            let type = ''
            switch (params.stat_type) {
                case 1:
                    type = 'dayStat'
                    params = {...dailyParams, ...params}
                    break
                case 2:
                    type = 'monthStat'
                    params = {...monthParams, ...params}
                    break
                case 3:
                    type = 'rankStat'
                    params = {...rankParams, ...params}
                    break
                default:
            }
            const res = yield call(query, parse(params))
            if (res && res.data) {
                const data = res.data
                yield put({
                    type: 'querySuccess',
                    payload: {
                        [type]: data
                    }
                })
                callback && callback()
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
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        }
    }
}