/**
 * @Description
 * @author XuMengPeng
 * @date 2018/10/30
*/
import {groupMessages} from 'community/services/groupMessage'
import {parse} from 'qs'
import moment from 'moment'
import config from "community/common/config"
const {DateFormat} = config


// 这个需要根据接口传参的值更改
const params = {
    limit: 50, // 分页
    offset: 0,

    // to_username: '',
    // to_uin: '',
    // user_id: '',
    is_context: 1,
    message_id: '',

    content: '', // 群聊天记录的input搜索框
    old_content: '',

    start_time: moment().subtract(90, 'days').format(DateFormat) + ' 00:00:00', //群聊天记录的起止时间
    end_time: moment().format(DateFormat) + ' 23:59:59',

    origin_app_message_type: '' // 过滤群里天记录的消息类型
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
    namespace: 'community_group_messages',
    state: {
        ..._state
    },

    subscriptions: {},

    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'showLoading'})
            let params = yield select(({community_group_messages}) => community_group_messages.params) //取当前 state
            params = {...params, ...payload.params}
            // payload.page初始化定位到最后一页不使用page，当切换分页导航，通过page来计算offset
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(groupMessages, parse(params))
            if (res.data) {
                params.content = ''
                params.offset = res.pagination.offset
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1
                    }
                })
                callback && callback(res)
            } else {
                yield put({type: 'hideLoading'})
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
