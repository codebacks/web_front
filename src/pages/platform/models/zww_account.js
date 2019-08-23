import {
    getAccountList,
    payment,
    settleRcordList,
    sendGameCurrencyList
} from "platform/services/zww_account"

export default {
    namespace: "zww_account",
    state: {
        list: [],
        total: 0,
        recordList: [],
        recordTotal: 0
    },

    effects: {
        // 获取列表
        *getAccountList({ payload, callback }, { select, call, put }) {
            yield put({
                type: "setProperty",
                payload: {
                    list: [],
                    total: 0
                }
            })
            const respones = yield call(getAccountList, payload)
            if (respones && respones.data) {
                yield put({
                    type: "setProperty",
                    payload: {
                        list: respones.data,
                        total:
                            respones.pagination &&
                            respones.pagination.rows_found
                    }
                })
                callback && callback()
            }
        },
        // 游戏币发送历史记录
        *sendGameCurrencyList({ payload, callback }, { select, call, put }) {
            const respones = yield call(sendGameCurrencyList, payload)
            yield put({
                type: "setProperty",
                payload: {
                    recordList: respones.data,
                    recordTotal:
                        respones.pagination && respones.pagination.rows_found
                }
            })
            callback && callback(respones.data)
        },
        // 结算记录
        *settleRcordList({ payload, callback }, { select, call, put }) {
            const respones = yield call(settleRcordList, payload)
            yield put({
                type: "setProperty",
                payload: {
                    recordList: respones.data,
                    recordTotal:
                        respones.pagination && respones.pagination.rows_found
                }
            })
            callback && callback(respones.data)
        },

        *payment({ payload, callback }, { select, call, put }) {
            const respones = yield call(payment, payload)
            if (respones && respones.data) {
                callback && callback(respones.data)
            }
        }
    },

    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    }
}
