import { centerList, isOpen, create, update } from '../../../mall/services/distributor/distributor_center'

export default {
    namespace: 'distributor_center',
    state: {
        centerList: '',
        isOpen: '',
    },
    effects: {
        *centerList({ payload, callback }, { select, call, put }) {
            const { data } = yield call(centerList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        centerList: data,
                    },
                })
            }
            callback && callback(data)
        },
        * create({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(create, payload.data)
            if (meta) {
                callback && callback(meta)
            }
        },
        * update({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(update, payload.data)
            if (meta) {
                callback && callback(meta)
            }
        },
        *isOpen({ payload, callback }, { call, put }) {
            const data = yield call(isOpen, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        isOpen: data.data
                    }
                })
                callback && callback()
            }
        },
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    }
}
