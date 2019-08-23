import {parse} from 'qs'
import config from "community/common/config"
import moment from 'moment'
import { queryByGroupStat, exportExcel } from "community/services/interactionStat"

const {DateFormat} = config

function getInitParams() {
    return {
        query: undefined,
        department_id: undefined,
        user_id: undefined,
        uin: undefined,
        start_time: moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
        end_time: moment().subtract(1, 'days').format(DateFormat) + ' 23:59:59',
        limit: 10,
        offset: 0,
        order_by: undefined, // 排序字段，字段名前面加‘-’为降序，不加升序
    }
}

export default {
    namespace: 'community_interaction_byGroupStat',
    state: {
        params: getInitParams(),
        list: [],
        total: 0,
        current: 1,
    },
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_interaction_byGroupStat}) => community_interaction_byGroupStat.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryByGroupStat, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
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