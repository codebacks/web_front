import { getLotteryRocordList,putLotteryRocord,activitiesDown,sendGrant,getLotteryRocord } from 'platform/services/lottery_activity'
import {getExpress} from '../../mall/services/orders/orderList'

export default {
    namespace: 'lottery_record',
    state: {
        list:[],
        total:0,
        detail:{},
        export:{}
    },
    effects: {
        *getLotteryRocordList({ payload, callback }, { select, call, put }) {
            const respones = yield call(getLotteryRocordList, payload)
            if (respones && respones.data) {
                yield put({
                    type: "setProperty",
                    payload: {
                        list:  respones.data.data ? respones.data.data: respones.data,
                        total:respones.pagination && respones.pagination.rows_found
                    }
                })
                callback && callback(respones)
            }
        },
        *getLotteryRocord({ payload, callback }, { select, call, put }) {
            const respones = yield call(getLotteryRocord, payload)
            if (respones && respones.data) {
                yield put({
                    type: "setProperty",
                    payload: {
                        detail:  respones.data
                    }
                })
                callback && callback(respones)
            }
        },
        *activitiesDown({ payload, callback }, { select, call, put }) {
            const respones = yield call(activitiesDown, payload)
            if (respones && respones.meta && respones.meta.code===200) {
                callback && callback(respones)
            }
        },
        *putLotteryRocord({ payload, callback }, { select, call, put }) {
            const respones = yield call(putLotteryRocord, payload)
            if (respones && respones.meta && respones.meta.code === 200) {
                callback && callback(respones)
            }
        },
        *sendGrant({ payload, callback }, { select, call, put }) {
            const respones = yield call(sendGrant, payload)
            if (respones && respones.meta && respones.meta.code === 200) {
                callback && callback(respones)
            }
        },
        * getExpress({payload, callback}, {select, call, put}) {
            const data = yield call(getExpress, payload)
            if (data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        express: data
                    }
                })
            }
            callback && callback(data)
        },
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    }
}





