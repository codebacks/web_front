import { queryAutoPullModal, updateAutoPullModalItem } from 'community/services/autoPull'
import { parse } from 'qs'

function getInitParams() {
    return {
        query: undefined,
        status: undefined, // 可用状态
        type: undefined,  // 1 新好友 2关键字
        keyword: undefined, // 当type是2时的关键字
        grouping_id: undefined, // 群分组
    }
}

export default {
    namespace: "community_autoPullModal",
    state: {
        params: getInitParams(),
        list: [],
        maxmember_options: [], // 人数上限options
        tags: [], // 群标签列表
    },
    subscriptions: {},

    effects: {
        // 该方法用于首次请求整个Modal所需对象的fetch（带参数first），和过滤list获得新的list
        * query({ payload, callback }, { select, put, call }) {
            let params = yield select(({community_autoPullModal}) => community_autoPullModal.params)
            const res = yield call(queryAutoPullModal, parse(params), payload.uin)
            if(res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res?.data?.chatrooms || [],
                        params: params,
                    }
                })
                callback && callback(res)
            }
        },
        * updateItem({payload, callback}, {select, call, put}) {
            let params = yield select(({community_autoPullModal}) => community_autoPullModal.params)
            let _payload = {
                uin: payload.uin,
                chatroom_name: payload.chatroom_name,
                body: { // 整合type和keyword
                    type: params?.type,
                    keyword: params?.keyword,
                    ...payload.body
                },
            }
            const res = yield call(updateAutoPullModalItem, _payload)
            if(res.data) {
                callback && callback(res)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            return {
                ...state, ...{
                    params: {
                        ...state.params,
                        ...action.payload.params,
                    },
                },
            }
        },
        resetParams(state) {
            return {...state, params: getInitParams()}
        },
    }
}