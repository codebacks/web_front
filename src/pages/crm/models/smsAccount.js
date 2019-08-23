import { getBuySMSList,getSMSCount } from 'platform/services/smsAccount'

export default {
    namespace: 'sms_account',
    state: {
        list: [],
        total:0,
        form: {
            pageNo: 1,
            pageSize: 10
        },
        reportList: {
            list:[],
            pageNo: 1,
            pageSize: 10,
            total:0
        },
        smsCount:0
    },
    effects: {
        // 购买列表
        *getBuySMSList({ payload, callback }, { select, call, put }) {
            const respones = yield call(getBuySMSList, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: respones.data,
                        total:respones.pagination && respones.pagination.rows_found
                    }
                })
                callback && callback()
            }
        },
        *getSMSCount({ payload, callback }, { select, call, put }) {
            const respones = yield call(getSMSCount, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        smsCount: respones.data.message_count
                    }
                })
                callback && callback(payload)
            }
        }
    },

    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
