import {
    tasks,
    shareMoments,
    details,
    taskResult,
    cancelExecution,
    reExecution,
    getArticleExtract,
    getLabels,
    getVideoInfo,
    getDefaultWatermark,
    cutVideo,
    verifyVideo,
    taskCount,
} from 'wx/services/automatic/moments'
import {getProcedure, goods, getMerchant, getMPACode} from 'wx/services/mall'
import {getInitData} from 'services'
import moment from 'moment'
import config from 'wx/common/config'

const {DateFormat} = config

function getInitParams() {
    return {
        limit: 10,
        offset: 0,
        keyword: '', // 群名
        content_type: '',
        execute_time_start: '',
        execute_time_end: '',
        create_time_start: moment().subtract(6, 'days').format(DateFormat) + ' 00:00:00',
        create_time_end: moment().format(DateFormat) + ' 23:59:59',
        order_column: '', // 需要排序的字段
        order_dir: '', // desc:降序，asc:升序
    }
}

const detailParams = {
    keyword: '', // 搜索
    status: '', // 执行状态
    limit: 10,
    offset: 0,
}

export default {
    namespace: 'wx_moments',

    state: {
        params: getInitParams(),
        tasks: [],
        total: 0,
        current: 1,
        detailParams: {
            ...detailParams
        },
        detailList: [],
        detailTotal: 0,
        detailCurrent: 1,
        result: {},
        moment: {},
    },

    effects: {
        * tasks({payload}, {call, put, select}) {
            let params = yield select(({wx_moments}) => wx_moments.params)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(tasks, params)
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        tasks: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: parseInt(data.pagination.offset / data.pagination.limit, 10) + 1
                    },
                })
            }
        },
        * details({payload}, {call, put, select}) {
            let params = yield select(({wx_moments}) => wx_moments.detailParams)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(details, params)
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detailList: data.data,
                        detailParams: params,
                        detailTotal: data.pagination.rows_found,
                        detailCurrent: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },
        * taskResult({ payload, callback }, { select, call, put }) {
            const data = yield call(taskResult, payload)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        result: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },
        * cancelExecution({payload, callback}, {call, put}) {
            let res = yield call(cancelExecution, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * reExecution({payload, callback}, {call, put}) {
            let res = yield call(reExecution, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * shareMoments({payload, callback}, {call, put}) {
            let res = yield call(shareMoments, payload.body)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * getArticleExtract({ payload, callback }, { select, call, put }) {
            const data = yield call(getArticleExtract, payload.body)
            if (data && data.data) {
                callback && callback(data.data)
            }
        },
        * getLabels({ payload, callback }, { select, call, put }) {
            const data = yield call(getLabels, payload)
            if (data) {
                callback && callback(data.data)
            }
        },
        * getVideoInfo({ payload, callback }, { select, call, put }) {
            const data = yield call(getVideoInfo, payload.url)
            if (data) {
                callback && callback(data)
            }
        },
        * getDefaultWatermark({ payload, callback }, { select, call, put }) {
            const res = yield call(getDefaultWatermark, payload.params)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * cutVideo({payload, callback}, {select, call, put}) {
            const res = yield call(cutVideo, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback(res.data)
            }
        },
        * verifyVideo({payload, callback}, {select, call, put}) {
            const res = yield call(verifyVideo, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback(res.data)
            }
        },
        * getProcedure({ payload, callback }, { select, call, put }) {
            const res = yield call(getProcedure, payload)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * getMerchant({payload, callback}, {select, call, put}) {
            const res = yield call(getMerchant)
            if (res) {
                callback && callback(res)
            }
        },
        * goods({payload, callback}, {call, put}) {
            const res = yield call(goods, payload.params)
            if (res && res.length) {
                callback && callback(res)
            }
        },
        * getMPACode({payload, callback}, {select, call, put}) {
            const res = yield call(getMPACode, payload)
            callback && callback(res)
        },
        * getInitData({payload, callback }, { select, call, put }) {
            const data = yield call(getInitData)
            if (data && data.data) {
                callback && callback(data.data)
            }
        },
        * taskCount({ payload, callback }, { select, call, put }) {
            const data = yield call(taskCount)
            if (data && data.data) {
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state) {
            return {...state, params: getInitParams()}
        },
        resetDetailParams(state) {
            return {...state, detailParams}
        }
    },
}
