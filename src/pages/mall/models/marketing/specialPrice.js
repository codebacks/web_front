import { getGoodsList, modifyRank, searchGoodsList, editGoodInfo, saveEditGood, saveNewGood, deleteSpecial } from 'mall/services/marketing/specialPrice'

export default {
    namespace: 'mall_special_price',
    state: {
        list: [],
        searchGoodsList: [],
        editGoodInfo: {},
        totalPage: 0,
        count: 0,
        mchList: [],
        totalAmount: '',
        totalCount: '',
        downLoadUrl: '',
        loading: false,
        tabValue: 0
    },

    effects: {
        * getGoodsList({payload, callback}, {select, call, put}) {
            const data = yield call(getGoodsList, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data,
                        tabValue: payload.status || 0
                    }
                })
            }
            callback && callback(data)
        },
        * modifyRank({payload, callback}, {select, call, put}) {
            const response = yield call(modifyRank, payload)
            const data = yield response.json()
            const { status } = response
            callback && callback(data,status)
        },
        * searchGoodsList({payload, callback}, {select, call, put}) {
            const response = yield call(searchGoodsList, payload)
            const data =yield response.json()
            const count = response.headers.get('row_count')
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        searchGoodsList: data,
                        count: Number(count)
                    }
                })
            }
            callback && callback(data)
        },
        * editGoodInfo({payload, callback}, {select, call, put}) {
            const data = yield call(editGoodInfo, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        editGoodInfo: data
                    }
                })
            }
            callback && callback(data)
        },
        * saveNewGood({payload, callback}, {select, call, put}) {
            const data = yield call(saveNewGood, payload)
            if (data) {
                yield put({
                    type: 'setProperty'
                })
            }
            callback && callback(data)
        },
        * saveEditGood({payload, callback}, {select, call, put}) {
            const data = yield call(saveEditGood, payload)
            if (data) {
                yield put({
                    type: 'setProperty'
                })
            }
            callback && callback(data)
        },
        * deleteSpecial({payload, callback}, {select, call, put}) {
            const response = yield call(deleteSpecial, payload)
            const data = yield response.json()
            const { status } = response
            callback && callback(data, status)
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        }
    }
}