
import { getWechatReport, getReportList, tryReportAgain } from 'data/services/weixin_analysis'

export default {
    namespace: 'weixin_analysis',
    state: {
        exportList: [],
        total: 0
    },

    effects: {
        * getWechatReport({payload, callback}, {select, call, put}) {
            const res = yield call(getWechatReport, payload)
            callback && callback(res)
        },
        * getReportList({payload, callback}, {select, call, put}) {
            const {data, pagination} = yield call(getReportList, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        exportList: data,
                        total: pagination.rows_found,
                    },
                })
            }
            callback && callback(data)
        },
        * tryReportAgain({payload, callback}, {select, call, put}) {
            const res = yield call(tryReportAgain, payload)
            callback && callback(res)
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    }
}
