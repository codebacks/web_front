import config from "community/common/config"
import moment from 'moment'
import {query} from 'community/services/keyword/autoReplyKeyword'

const {DateFormat} = config

function getInitParams() {
    return {
        limit: 10,
        offset: 0,
        query: undefined,
        start_time: moment().subtract(1,'days').format(DateFormat) + ' 00:00:00',
        end_time: moment().subtract(1,'days').format(DateFormat) + ' 23:59:59',
        order_by: undefined, // 排序字段，字段名前面加‘-’为降序，不加升序
    }
}


export default {
    namespace: 'community_keywordStat_autoReplyKeyword',
    state: {
        params: getInitParams(),
        list: [],
        total: 0,
        current: 1,
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_keywordStat_autoReplyKeyword}) => community_keywordStat_autoReplyKeyword.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(query, params)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: parseInt(data.pagination.offset / data.pagination.limit, 10) + 1
                    }
                })
            }
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