
import {template_messages, open_messages, close_messages,templateMessagesDetail,putTemplateMessages} from '../services/template_settings'
export default {
    namespace: 'template_settings',
    state: {
        template_messages: [],
        detail:{}
    },
    effects: {
        *template_messages({payload, callback}, {select, call, put}) {
            const {data} = yield call(template_messages, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {template_messages: data}})
                callback && callback(data)
            }
        },
        * open_messages({payload, callback}, {select, call, put}) {
            const response = yield call(open_messages, payload)

            if(response) {
                callback && callback(response)
            }
        },
        * close_messages({payload, callback}, {select, call, put}) {
            const response = yield call(close_messages, payload)

            if(response) {
                callback && callback(response)
            }
        },
        *templateMessagesDetail({payload, callback}, {select, call, put}) {
            const {data} = yield call(templateMessagesDetail, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {detail: data}})
                callback && callback(data)
            }
        },
        *putTemplateMessages({payload, callback}, {select, call, put}) {
            const {data} = yield call(putTemplateMessages, payload)

            if(data) {
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
