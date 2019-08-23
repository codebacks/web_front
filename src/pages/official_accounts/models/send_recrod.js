
import {messageHistories,messageHistoriesDetail} from '../services/send_record'
export default {
    namespace: 'template_send_record',
    state: {
        list: [],
        total:0,
        detail:{}
    },
    effects: {
        *messageHistories({payload, callback}, {select, call, put}) {
            const respones = yield call(messageHistories, payload)
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
        
        *messageHistoriesDetail({payload, callback}, {select, call, put}) {
            const {data} = yield call(messageHistoriesDetail, payload)
            if(data) {
                yield put({type: 'setProperty', payload: {detail: data}})
                callback && callback(data)
            }
        },
        
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
