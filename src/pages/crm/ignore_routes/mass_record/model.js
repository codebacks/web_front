import {
    tasks,
    details,
    summary,
    cancelled,
    task,
    exportTask,
    exportExcel,
} from 'crm/services/massSending'
import moment from "moment"
import createModel from 'utils/model'
import _ from "lodash"

function getInitParams() {
    return {
        title: '',
        user_id: '',
        create_time: [null, null],
        execute_time: [null, null],
        limit: 10,
        offset: 0,
    }
}

function getInitDetailParams() {
    return {
        query: '', // 搜索
        status: '', // 执行状态
        limit: 10,
        offset: 0,
    }
}

function getInitState() {
    return {
        list: [],
        params: getInitParams(),
        total: 0,
        current: 1,
        detailParams: getInitDetailParams(),
        detailList: [],
        detailTotal: 0,
        detailCurrent: 1,
        result: [],
    }
}

export default createModel({
    namespace: 'crm_massRecord',
    state: getInitState(),
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let {
                params,
                current,
            } = yield select(({crm_massRecord}) => crm_massRecord)

            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            let query = {...params, ...params.status}

            query.create_time = ''
            let createStart = '', createEnd = ''
            if (params.create_time[0]) {
                createStart = `${moment(params.create_time[0]).format('YYYY-MM-DD')} 00:00:00`
            }
            if (params.create_time[1]) {
                createEnd = `${moment(params.create_time[1]).format('YYYY-MM-DD')} 23:59:59`
            }
            if(params.create_time[0] || params.create_time[1]) {
                query.create_time = `${createStart},${createEnd}`
            }

            query.execute_time = ''
            let executeStart = '', executeEnd = ''
            if (params.execute_time[0]) {
                executeStart = `${moment(params.execute_time[0]).format('YYYY-MM-DD')} 00:00:00`
            }
            if (params.execute_time[1]) {
                executeEnd = `${moment(params.execute_time[1]).format('YYYY-MM-DD')} 23:59:59`
            }
            if(params.execute_time[0] || params.execute_time[1]){
                query.execute_time = `${executeStart},${executeEnd}`
            }

            const res = yield call(tasks, query)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: payload.page === undefined ? current : payload.page,
                    },
                })
                callback && callback(res.data)
            }
        },
        * details({payload, callback}, {select, call, put}) {
            let {
                detailParams,
                detailCurrent,
            } = yield select(({crm_massRecord}) => crm_massRecord)
            detailParams = {...detailParams, ...payload}
            if (payload.page) {
                detailParams.offset = detailParams.limit * (payload.page - 1)
            }
            const data = yield call(details, detailParams)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detailList: data.data,
                        detailParams: detailParams,
                        detailTotal: _.get(data, 'pagination.rows_found'),
                        detailCurrent: payload.page === undefined ? detailCurrent : payload.page,
                    },
                })
            }
        },
        * taskResult({payload, callback}, {select, call, put}) {
            const data = yield call(task, payload)
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
        * summary({payload, callback}, {select, call, put}) {
            const data = yield call(summary, payload)
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
        * cancelled({payload, callback}, {select, call, put}) {
            const {meta} = yield call(cancelled, payload)
            if (meta && meta.code === 200) {
                callback && callback()
            }
        },
        * exportTask({payload, callback}, {select, call, put}) {
            let params = yield select(({crm_massRecord}) => crm_massRecord.detailParams)
            const res = yield call(exportTask, payload, params)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * exportExcel({payload, callback}, {select, call, put}) {
            const res = yield call(exportExcel, payload)
            callback && callback(res)
        },
    },
    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
        resetDetailParams(state, action) {
            return {...state, detailParams: getInitDetailParams()}
        },
    },
})

