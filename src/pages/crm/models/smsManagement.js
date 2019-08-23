import { getMsmTemplateList, getMsmTemplateDatail, postMsmTemplate, putMsmTemplate, deleteMsmTemplate, qrcodes,getQrcodelist } from 'platform/services/smsManagement'

export default {
    namespace: 'sms_managamnet',
    state: {
        list: [],
        detail: {},
        total: 0,
        data:[],
        rows_found:0
    },

    effects: {
        // 获取短信模板列表
        *getMsmTemplateList({ payload, callback }, { select, call, put }) {
            const respones = yield call(getMsmTemplateList, payload)
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
        * getQrcodeList({payload, callback}, {select, call, put}) {
            const data = yield call(getQrcodelist, payload)
            if(data.data) {                
                yield put({
                    type: 'setProperty',
                    payload: {
                        data: data.data,
                        rows_found:data.pagination.rows_found
                    }
                })
                callback()
            }
        },
        *getMsmTemplateDatail({ payload, callback }, { select, call, put }) {
            const respones = yield call(getMsmTemplateDatail, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detail: respones.data
                    }
                })
                callback && callback(respones.data)
            }
        },
        // 新码列表
        * qrcodes({ payload, callback }, { select, call, put }) {
            const data = yield call(qrcodes, payload)
            if (data) {
                callback && callback(data.data)
            }
        },
        *postMsmTemplate({ payload, callback }, { select, call, put }) {
            const respones = yield call(postMsmTemplate, payload)
            if (respones && respones.data) {
                callback && callback()
            }
        },

        *putMsmTemplate({ payload, callback }, { select, call, put }) {
            const respones = yield call(putMsmTemplate, payload)
            if (respones && respones.data) {
                callback && callback()
            }
        },
        *deleteMsmTemplate({ payload, callback }, { select, call, put }) {
            const respones = yield call(deleteMsmTemplate, payload)
            if (respones && respones.data) {
                callback && callback()
            }
        }
    },

    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
