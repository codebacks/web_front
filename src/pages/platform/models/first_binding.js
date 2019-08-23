import { listData, create, activitiesDetail, remove, update, downline, graphicStatistics, isOpen, shops } from 'platform/services/first_binding'

export default {
    namespace: 'platform_first_binding',

    state: {
        rows_found: 0,
        listData: [],
        activitiesDetailData: '',
        graphicStatisticsData: [],
        countsData: '',
        isOpen: '',
        shopsData:[]
    },
    effects: {
        * listData({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(listData, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        listData: data,
                        rows_found: pagination.rows_found
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
        *activitiesDetail({ payload, callback }, { select, call, put }) {
            const data = yield call(activitiesDetail, payload.activity_id)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        activitiesDetailData: data.data,
                    },
                })
            }
            callback && callback(data)
        },
        * remove({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(remove, payload)
            if (meta && meta.code === 200) {
                callback && callback()
            }
        },
        * downline({ payload, callback }, { select, call, put }) {
            const { data } = yield call(downline, payload)
            if (data) {
                callback && callback()
            }
        },
        // 是否开通
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
        * shops({ payload, callback }, { select, call, put }) {
            const data = yield call(shops, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        shopsData: data.data,
                    },
                })
                callback && callback(data)
            }
        },
        *graphicStatistics({ payload, callback }, { select, call, put }) {
            const data = yield call(graphicStatistics, payload)

            callback && callback(data)
        },
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}