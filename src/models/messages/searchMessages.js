
function getInitParams() {
    return {
        uin: '', // 微信号UIN
        wechat_id: '', // 好友微信用户名
        key: '', // 关键字，type为1时有效
        type: '', //  消息类型，1文本,49链接 目前仅支持1
        app_msg_type: undefined, // 消息应用类型，当type为49时有效，支持搜索消息应用类型
        start_time: '',
        end_time: '',
        limit: 20,
        offset: 0,
    }
}

export default {
    namespace: 'search_messages',
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
