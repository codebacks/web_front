import { getKeplerCardList, getGroupList, addGroup, createCard, cardDetail, deleteCard, editCardConfig, getCardConfig, moveCardGroup } from '../services/kepler_program'
import { getToken } from '../../setting/services/shops'

export default {
    namespace: 'kepler_program',
    state: {
        count: 0,
        photoToken: '',
        photoPrefix: '',
        cardList: [],
        groupArray: []
    },

    effects: {
        *getToken({payload, callback},{call, put}){
            const data = yield call(getToken, payload)
            if(data){
                yield put({
                    type: 'setProperty',
                    payload: {
                        photoToken: data.data.token,
                        photoPrefix: data.data.prefix,
                    },
                })
            }
        },
        * getKeplerCardList({payload, callback}, {select, call, put}) {
            const res = yield call(getKeplerCardList, payload)
            if (res) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        cardList: res.data,
                        count: res.pagination.rows_found
                    }
                })
            }
            callback && callback(res)
        },
        * getGroupList({payload, callback}, {select, call, put}) {
            const res = yield call(getGroupList, payload)
            if (res) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        groupArray: res.data
                    }
                })
            }
            callback && callback(res)
        },
        * addGroup({payload, callback}, {select, call, put}) {
            const res = yield call(addGroup, payload)
            if (res) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    }
                })
            }
            callback && callback(res)
        },
        * createCard({payload, callback}, {select, call, put}) {
            const res = yield call(createCard, payload)
            if (res) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    }
                })
            }
            callback && callback(res)
        },
        * deleteCard({payload, callback}, {select, call, put}) {
            const res = yield call(deleteCard, payload)
            if (res) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    }
                })
            }
            callback && callback(res)
        },
        * cardDetail({payload, callback}, {select, call, put}) {
            const res = yield call(cardDetail, payload)
            if (res) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    }
                })
            }
            callback && callback(res)
        },
        * editCardConfig({payload, callback}, {select, call, put}) {
            const res = yield call(editCardConfig, payload)
            if (res) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    }
                })
            }
            callback && callback(res)
        },
        * getCardConfig({payload, callback}, {select, call, put}) {
            const res = yield call(getCardConfig, payload)
            if (res) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    }
                })
            }
            callback && callback(res)
        },
        * moveCardGroup({payload, callback}, {select, call, put}) {
            const res = yield call(moveCardGroup, payload)
            if (res) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    }
                })
            }
            callback && callback(res)
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        }
    }
}