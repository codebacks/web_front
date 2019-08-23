import {
    details,
    result,
    momentContent,
    momentDetail,
} from 'wx/services/automatic/momentsLog'
import {parse} from "qs"

const params = {
    limit: 10,
    offset: 0,
    status: '', // 朋友圈状态
    keyword: '', // 搜索备注、昵称、微信号
    content_desc: '', // 朋友圈内容
    content_type: '', // 朋友圈类型
    execute_time_start: '',
    execute_time_end: '',
    department_id: undefined,
    user_id: undefined,
}

export default {
    namespace: 'wx_moments_log',

    state: {
        params: {
            ...params
        },
        loading: false,
        list: [],
        total: 0,
        current: 1,
        result: {},
        content: {},
        detail: {},
    },

    effects: {
        * details({payload}, {call, put, select}) {
            yield put({ type: 'setProperty', payload: { loading: true } })
            let params = yield select(({wx_moments_log}) => wx_moments_log.params)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(details, parse(params))
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
            yield put({ type: 'setProperty', payload: { loading: false } })
        },

        * result({ payload, callback }, { select, call, put }) {
            const data = yield call(result, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        result: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },

        * momentContent({payload, callback}, {select, call, put}) {
            const data = yield call(momentContent, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        content: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },

        * momentDetail({payload, callback}, {select, call, put}) {
            const data = yield call(momentDetail, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detail: data.data,
                    },
                })
                callback && callback(data.data)
            }
        }
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state) {
            return {...state, params}
        },
    },
}
