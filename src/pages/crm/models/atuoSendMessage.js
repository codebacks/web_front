
import {autoSendList,
    postAutoSend,
    deleteAutoSend,
    getAutoSendRules,
    putAutoSendRules,
    putOpenAutoSend,
    postAutoSendRules,
    getAutoSend} from '../services/atuoSendMessage'

export default {
    namespace: 'atuo_send_message',
    state: {
        list: [],
        total: 0,
        rule:{},
        detail:{}
    },
    effects: {
        *autoSendList({ payload, callback }, { select, call, put }) {
            const respones = yield call(autoSendList, payload)
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
        *getAutoSend({ payload, callback }, { select, call, put }) {
            const respones = yield call(getAutoSend, payload)
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
        *getAutoSendRules({ payload, callback }, { select, call, put }) {
            const respones = yield call(getAutoSendRules, payload)
            if (respones && respones.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        rule: respones.data
                    }
                })
                callback && callback(respones.data)
            }
        },
        *putOpenAutoSend({ payload, callback }, { select, call, put }) {
            const respones = yield call(putOpenAutoSend, payload)
            if (respones && respones.data) {
                callback && callback()
            }
        },
        *postAutoSendRules({ payload, callback }, { select, call, put }) {
            const respones = yield call(postAutoSendRules, payload)
            if (respones ) {
                callback && callback(respones)
            }
        },
        *postAutoSend({ payload, callback }, { select, call, put }) {
            const respones = yield call(postAutoSend, payload)
            if (respones && respones.data) {
                callback && callback()
            }
        },
        *deleteAutoSend({ payload, callback }, { select, call, put }) {
            const respones = yield call(deleteAutoSend, payload)
            if (respones) {
                callback && callback()
            }
        },
        *putAutoSendRules({ payload, callback }, { select, call, put }) {
            const respones = yield call(putAutoSendRules, payload)
            if (respones) {
                callback && callback()
            }
        }
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
    },
}
