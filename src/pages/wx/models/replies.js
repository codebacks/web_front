import {query, create, modify, remove, swap, setTop} from 'wx/services/replies'
import {parse} from 'qs'

export default {
    namespace: 'wx_replies',
    state: {
        list: [],
        loading: false,
    },

    subscriptions: {},

    effects: {
        * query({payload, callback}, {call, put}) {
            const data = yield call(query, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data
                    }
                })
                callback && callback()
            }
        },
        * create({payload, callback}, {call, put}) {
            const data = yield call(create, parse(payload))
            if (data && data.data) {
                callback && callback()
            }
        },
        * modify({payload, callback}, {select, call, put}) {
            const data = yield call(modify, payload)
            if (data && data.data) {
                callback && callback()
            }
        },
        * remove({payload, callback}, {call, put}) {
            const data = yield call(remove, parse(payload))
            if (data) {
                yield put({
                    type: 'removeSuccess',
                    payload: {
                        id: payload.id
                    }
                })
                callback && callback()
            }
        },
	    * setTop({ payload, callback }, { call, put }) {
		    yield put({
			    type: 'setProperty',
			    payload: {
				    list: payload.newList
			    }
		    })
		    yield call(setTop, parse({ ids: payload.ids }))
		    if (callback) {
			    callback()
		    }
	    },
	    * swap({ payload, callback }, { call, put }) {
		    yield put({
			    type: 'setProperty',
			    payload: {
				    list: payload.newList
			    }
		    })
		    yield call(swap, parse({ ids: payload.ids }))
		    if (callback) {
			    callback()
		    }
	    }
    },

    reducers: {
	    setProperty(state, action) {
		    return {...state, ...action.payload}
	    },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        },
        removeSuccess(state, action) {
            let list = state.list.filter((item) => {
                return item.id !== action.payload.id
            })
            return {...state, ...{list: list}}
        }

    }
}