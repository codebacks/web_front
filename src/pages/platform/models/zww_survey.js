import { getAccountStatus, openService } from 'platform/services/zww_survey'

export default {
    namespace: 'zww_survey',
    state: {
        // 是否开通
        isOpen: '',
        // 游戏币
        yesterIsk: 0,
        sevenIsk: 0,
        totalIsk: 0,
        // 账单
        yesterMoney: 0,
        yesterUnset: 0,
        sevenMoney: 0,
        sevenUnset: 0,
        totalMoney: 0,
        totalUnset: 0,
    },

    effects: {
        // 获取账户信息
        *getAccountStatus({ payload, callback }, { select, call, put }) {
            const { data } = yield call(getAccountStatus, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        isOpen: data.status,
                        yesterIsk: data.yesterday_coin_count,
                        sevenIsk: data.last_seven_day_coin_count,
                        totalIsk: data.coin_count,
                        yesterMoney: data.yesterday_settle_order_amount,
                        yesterUnset: data.yesterday_unsettle_order_amount,
                        sevenMoney: data.last_seven_day_settle_order_amount,
                        sevenUnset: data.last_seven_day_unsettle_order_amount,
                        totalMoney: data.total_amount,
                        totalUnset: data.un_paid_amount,
                    }
                })
                callback && callback()
            } else { 
                // 如果没返回数据，
                yield put({
                    type: 'setProperty',
                    payload: {
                        isOpen: 0,
                    }
                })
                callback && callback()
            }
        },
        *openService({ payload, callback }, { select, call, put }) {
            const { data } = yield call(openService, payload)
            if (data) {
                callback && callback()
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    }, 
}