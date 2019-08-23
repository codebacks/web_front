import { getGoodsList, selectGoods, goodDetail, groupDetail, editGroup, addGroup, deleteGroup, closeGroup } from 'mall/services/marketing/group'

export default {
    namespace: 'mall_group',
    state: {
        list: [],
        selectGoods: [],
        goodDetail: {},
        count: 0,
        totalPage: 0,
        totalAmount: '',
        totalCount: 0,
        tabValue: 0,
        current: 0,
        pageSize: 10
    },

    effects: {
        * getGoodsList({payload, callback}, {select, call, put}) {
            const response = yield call(getGoodsList, payload)
            const data = yield response.json()
            const totalCount = response.headers.get('row_count')
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data,
                        totalCount: totalCount,
                        tabValue: payload.status || 0,
                        current: payload.page || 0,
                        pageSize: payload.per_page || 10
                    }
                })
            }
            callback && callback(data)
        },
        * selectGoods({payload, callback}, {select, call, put}) {
            const response = yield call(selectGoods, payload)
            const data = yield response.json()
            const count = response.headers.get('row_count')
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        selectGoods: data,
                        count: count
                    }
                })
            }
            callback && callback(data)
        },
        * goodDetail({payload, callback}, {select, call, put}) {
            const data = yield call(goodDetail, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        goodDetail: data,
                    }
                })
            }
            callback && callback(data)
        },
        * groupDetail({payload, callback}, {select, call, put}) {
            const data = yield call(groupDetail, payload)
            if (data) {
                yield put({
                    type: 'setProperty'
                })
            }
            callback && callback(data)
        },
        * editGroup({payload, callback}, {select, call, put}) {
            const data = yield call(editGroup, payload)
            if (data) {
                yield put({
                    type: 'setProperty'
                })
            }
            callback && callback(data)
        },
        * deleteGroup({payload, callback}, {select, call, put}) {
            const response = yield call(deleteGroup, payload)
            const data = yield response.json()
            const { status } = response
            callback && callback(data, status)
        },
        * addGroup({payload, callback}, {select, call, put}) {
            const data = yield call(addGroup, payload)
            if (data) {
                yield put({
                    type: 'setProperty'
                })
            }
            callback && callback(data)
        },
        * closeGroup({payload, callback}, {select, call, put}) {
            const data = yield call(closeGroup, payload)
            if (data) {
                yield put({
                    type: 'setProperty'
                })
            }
            callback && callback(data)
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        }
    }
}