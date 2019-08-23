import moment from 'moment'
import {parse} from 'qs'
import config from 'data/common/config'
import {queryFriends, exportFriendsTask as exportTask, exportFriendsExcel as exportExcel} from 'data/services/performanceFJ'

const {DateFormat} = config

const params = {
    department_id: undefined,
    user_id: undefined,
    start_time: moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    end_time: moment().subtract(1, 'days').format(DateFormat) + ' 23:59:59',
    by_wechat: undefined,
    limit: 10,
    offset: 0
}

export default {
    namespace: 'data_performance_friends',
    state: {
        list: [],
        params: {
            ...params
        },
        loading: false,
        total: 0,
        current: 1,
    },

    subscriptions: {},

    effects: {
        * query({payload}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let params = yield select(({data_performance_friends}) => data_performance_friends.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryFriends, parse({params: params}))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
            }
            yield put({type: 'hideLoading'})
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
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params}
        }
    }
}
