import {messages} from 'wx/services/wechats'
// import config from 'wx/common/config'
// import moment from 'moment';

// const {DateFormat} = config

const params = {
    limit: 10,
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
    data: [],
    rendered: false,
    prevList: [],
    list: [],
    params: {...params},
    wechats: [],
    friendTags: [],
    users: [], //客服列表
    total: 0,
    current: 1,
}
export default {
    namespace: 'wx_messages',
    state: {
        ..._state
    },

    subscriptions: {},

    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({wx_messages}) => wx_messages.params) //取当前 state
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(messages, params)
            if (res && res.data) {
                params.content = ''
                params.offset = res.pagination.offset
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1

                    }
                })
                callback && callback(res.data)
            }
        },
    },

    reducers: {
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
