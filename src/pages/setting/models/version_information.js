
import {
    currentVersion,
    createVersionOrder,
    phoneInfo,
    upgradeVersionCharge,
    queryPayStatus,
    queryOrderStatus
} from 'setting/services/version_information'


export default {
    namespace: 'setting_version_information',

    state: {
        versionInfo:{},
        phoneInfo:[],
        orderInfo:{}
    },

    effects: {
        //获取数据列表
        *currentVersion ({ payload, callback }, { select, call, put }) {
            const {data} = yield call(currentVersion, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        versionInfo:data
                    },
                })
                callback && callback(data)
            }
        },
        *phoneInfo ({ payload, callback }, { select, call, put }) {
            const { data } = yield call(phoneInfo, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        phoneInfo:data
                    },
                })
                callback && callback(data)
            }
        },
        *createVersionOrder ({ payload, callback }, { select, call, put }) {
            const { data } = yield call(createVersionOrder, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    },
                })
                callback && callback(data)
            }
        },
        *queryPayStatus ({ payload, callback }, { select, call, put }) {
            const { data } = yield call(queryPayStatus, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    },
                })
                callback && callback(data)
            }
        },
        *queryOrderStatus ({ payload, callback }, { select, call, put }) {
            const data  = yield call(queryOrderStatus, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        orderInfo:data
                    },
                })
                callback && callback(data)
            }
        },
        *upgradeVersionCharge({ payload, callback },{ select, call, put }) {
            const { data } = yield call(upgradeVersionCharge, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                    },
                })
                callback && callback(data)
            }
        },


    },

    reducers: {
        //将请求的店铺数据列表的数据显示到页面上
        setProperty(state, action) {
            return { ...state, ...action.payload }
        },
    },
}
