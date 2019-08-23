
import {
    getTableList,
    afterSale
} from 'setting/services/service_log'


export default {
    namespace: 'setting_service_log',

    state: {
        data:[],
        total:0
    },

    effects: {
        *getTableList ({ payload, callback }, { select, call, put }) {
            const {data,pagination} = yield call(getTableList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        data:data,
                        total:pagination.rows_found
                    },
                })
                callback && callback(data)
            }
        },
        *afterSale({ payload, callback }, { select, call, put }) {
            const {meta,data} = yield call(afterSale, payload)
            if (meta.code === 200 && data) {
                callback && callback()
            }
        }
    },

    reducers: {
        //将请求的店铺数据列表的数据显示到页面上
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
