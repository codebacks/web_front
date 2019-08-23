import { listData, create, shops, qrcodes, activitiesDetail, downline, statistics, getToken, update, remove, qrcodesImg, isOpen, goods } from 'platform/services/blueprint'

export default {
    namespace: 'platform_blueprint',
    state: {
        blueprintData: [],
        shopsData: [],
        qrcodesData: [],
        statisticsData: [],
        token: "",
        rows_found: '',
        activitiesDetailData: '',
        isOpen: '',
        goodsData: []
    },
    effects: {
        //审核数据列表
        * listData({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(listData, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        blueprintData: data.data,
                        rows_found: pagination.rows_found
                    },
                })
            }
            callback && callback(data)
        },
        // 创建活动
        * create({ payload, callback }, { select, call, put }) {
            const { data } = yield call(create, payload.data)
            if (data) {
                callback && callback(data)
            }
        },
        * update({ payload, callback }, { select, call, put }) {
            const { data } = yield call(update, payload.data)
            if (data) {
                callback && callback(data)
            }
        },
        // 获取店铺列表
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
        // 新码列表
        * qrcodes({ payload, callback }, { select, call, put }) {
            const data = yield call(qrcodes, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        qrcodesData: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },
        // 商品列表
        * goods({ payload, callback }, { select, call, put }) {
            const { data, pagination } = yield call(goods, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        goodsData: data,
                        rows_found: pagination.rows_found
                    },
                })
                callback && callback(data)
            }
        },
        // 活动详情
        *activitiesDetail({ payload, callback }, { select, call, put }) {
            const data = yield call(activitiesDetail, payload.id)
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
        // 活动下线
        * downline({ payload, callback }, { select, call, put }) {
            const { data } = yield call(downline, payload)
            if (data) {
                callback && callback()
            }
        },
        // 活动统计
        * statistics({ payload, callback }, { select, call, put }) {
            const { data } = yield call(statistics, payload.id)

            yield put({
                type: 'setProperty',
                payload: {
                    statisticsData: data || [],
                },
            })

            callback && callback()
        },
        * qrcodesImg({ payload, callback }, { select, call, put }) {
            const { data } = yield call(qrcodesImg, payload.id)
            callback && callback(data)
        },
        // 删除活动
        * remove({ payload, callback }, { select, call, put }) {
            const { meta } = yield call(remove, payload)
            if (meta && meta.code === 200) {
                callback && callback()
            }
        },
        // 获取token
        *getToken({ payload, callback }, { call, put }) {
            const data = yield call(getToken, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        token: data.data.token,
                    },
                })
            }
        }
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
