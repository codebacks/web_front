import { getLotteryActivitiesList,getLotteryActivities,postLotteryActivities,putLotteryActivities,getActivitiesStat,deleteLotteryActivities,activitiesDown } from 'platform/services/lottery_activity'
import {subData} from 'setting/services/subscription'
export default {
    namespace: 'lottery_activity',

    state: {
        list:[],
        total:0,
        detail:{},
        record:{},
        subData:[]
    },
    effects: {
        *getLotteryActivitiesList({ payload, callback }, { select, call, put }) {
            const respones = yield call(getLotteryActivitiesList, payload)
            if (respones) {
                yield put({
                    type: "setProperty",
                    payload: {
                        list: respones.data.data ? respones.data.data:respones.data,
                        total:respones.pagination && respones.pagination.rows_found
                    }
                })
                callback && callback(respones)
            }
        },
        *getLotteryActivities({ payload, callback }, { select, call, put }) {
            const respones = yield call(getLotteryActivities, payload)
            if (respones && respones.data) {
                yield put({
                    type: "setProperty",
                    payload: {
                        detail: respones.data,
                    }
                })
                callback && callback(respones.data)
            }
        },
        *getActivitiesStat({ payload, callback }, { select, call, put }) {
            const respones = yield call(getActivitiesStat, payload)
            if (respones && respones.meta && respones.meta.code===200) {
                yield put({
                    type: "setProperty",
                    payload: {
                        record: respones.data,
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
        *deleteLotteryActivities({ payload, callback }, { select, call, put }) {
            const respones = yield call(deleteLotteryActivities, payload)
            if (respones && respones.meta && respones.meta.code===200) {
                callback && callback(respones)
            }
        },
        *postLotteryActivities({ payload, callback }, { select, call, put }) {
            const respones = yield call(postLotteryActivities, payload)
            if (respones && respones.meta && respones.meta.code===200) {
                callback && callback(respones)
            }
        },
        *putLotteryActivities({ payload, callback }, { select, call, put }) {
            const respones = yield call(putLotteryActivities, payload)
            if (respones && respones.meta && respones.meta.code===200) {
                callback && callback(respones)
            }
        },
        * subData({payload, callback}, {select, call, put}) {
            const {data} = yield call(subData, payload)

            if(data) {
                yield put({type: 'setProperty', payload: {subData: data}})
                callback && callback(data)
            }
        },
    },
    reducers: {
        setProperty(state, action) {
            return { ...state, ...action.payload }
        }
    }
}





