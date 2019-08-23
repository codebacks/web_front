
function getInitParams() {
    return {
        uin: '', // 微信号UIN
        chatroom_id: '', // 群id
        key: '', // 关键字，type为1时有效
        type: '', //  消息类型，1文本,49链接 目前仅支持1
        app_msg_type: undefined, // 消息应用类型，当type为49时有效，支持搜索消息应用类型、
        is_at: undefined, // type为1时有效
        start_time: undefined,
        end_time: undefined,
        limit: 20,
        offset: 0,
    }
}

export default {
    namespace: 'group_search_messages',
    state: {
        params: getInitParams(),
        total: 0,
        list: [],
        searchParams: {}
    },

    subscriptions: {},

    effects: {

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
        resetSearchParams(state, action) {
            return {...state, searchParams: {}}
        },
    }
}
