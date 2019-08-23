import {parse} from 'qs'
import { queryWechatsReports as query, queryWechatsReportsOverview as overview} from "data/services/business"


export default {
    namespace: 'data_business_wechat_report',
    state: {
        params: {
            last_sync_db_time: undefined,
            low_battery: undefined,
            department_id: undefined,
            query: undefined,
            im_online_status: "",
            valid_boot_time: undefined,
            valid_version: undefined
        },

        loading: false,
        resData: [],
        overviewData: []

    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let {params} = yield select(((state) => state.data_business_wechat_report))
            const res = yield call(query, parse(params))
            if (res && res.data) {
                const data = res.data
                yield put({
                    type: 'querySuccess',
                    payload: {
                        resData: data
                    }
                })
                callback && callback()
            }
            yield put({type: 'hideLoading'})

        },
        * overview({payload, callback}, {select, call, put}) {
            const res = yield call(overview)
            if (res && res.data) {
                const data = res.data
                yield put({
                    type: 'querySuccess',
                    payload: {
                        overviewData: data
                    }
                })
                callback && callback()
            }
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
