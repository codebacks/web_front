import {messages} from 'crm/services/wechats'
// import config from 'crm/common/config'
// import moment from 'moment';
import {parse} from 'qs'

// const {DateFormat} = config

const params = {
    limit: 50,
    offset: 0,
    user_id: '',
    to_username: '',
    to_uin: '',
    is_context: 1,
    content: '',
    old_content: '',
    message_id: '',
    start_time: '',// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    end_time: '',// moment().format(DateFormat) + ' 23:59:59',
    origin_app_message_type: ''
}

const _state = {
    list: [],
    params: {...params},
    wechats: [],
    friendTags: [],
    users: [], //客服列表
    total: 0,
    current: 1,
    loading: false,
}
export default {
    namespace: 'crm_messages',
    state: {
        ..._state
    },

    subscriptions: {},

    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let params = yield select(({crm_messages}) => crm_messages.params) //取当前 state
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(messages, parse(params))
            if (data && data.data) {
                params.content = ''
                // let page = data.pagination.offset / data.pagination.limit;
                // page = page === parseInt(page, 10) ? page : page + 1;
                params.offset = data.pagination.offset
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: parseInt(data.pagination.offset / data.pagination.limit, 10) + 1

                    }
                })
                callback && callback(data)
            } else {
                yield put({type: 'hideLoading'})
            }
        }

    },

    reducers: {
        showLoading(state) {
            return {...state, loading: true}
        },
        hideLoading(state) {
            return {...state, loading: false}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload}
            return {...state, ...{params: params}}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params}
        }

    }
}
