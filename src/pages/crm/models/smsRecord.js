import { getMsmSendList, getMsmSendReportList } from 'platform/services/smsRecord'

export default {
    namespace: 'sms_record',
    state: {
        list: [],
        total: 0,
        reportList: [],
        reportTotal: 0
    },
    effects: {
        // 获取短信发送列表
        *getMsmSendList({ payload, callback }, { select, call, put }) {
            const respones = yield call(getMsmSendList, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: respones.data,
                        total: respones.pagination && respones.pagination.rows_found
                    }
                })
                callback && callback()
            }
        },
        // 短信模板搜索
        *getMsmTemplateList({ payload, callback }, { select, call, put }) {
            const respones = yield call(getMsmSendList, payload)
            if (respones && respones.data) {
                callback && callback(respones.data)
            }
        },
        // 获取短信错误信息列表
        *getMsmSendReportList({ payload, callback }, { select, call, put }) {
            const respones = yield call(getMsmSendReportList, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        reportList: respones.data,
                        reportTotal: respones.pagination && respones.pagination.rows_found
                    }
                })
                callback && callback()
            }
        }
    },

    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    }
}
