import {
    tasks,
    details,
    reExecute,
    task,
    cancelled,
    exportTask,
    exportExcel,
    exportTaskMsg,
    checkMass,
} from 'community/services/mass'
import {parse} from "qs"
import {objMomentToTime} from './components/DateRange'
import _ from 'lodash'

const initParams = {
    limit: 10,
    offset: 0,
    title: '', // 群名
    createStart: null,
    createEnd: null,
    executeStart: null,
    executeEnd: null,
    create_time: '',
    execute_time: '',
}

const initDetailParams = {
    query: '', // 搜索
    wechat: '',
    status: '', // 执行状态
    limit: 10,
    offset: 0,
}

export default {
    namespace: 'community_automaticGroupMsg',

    state: {
        params: {
            ...initParams,
        },
        tasks: [],
        total: 0,
        current: 1,
        detailParams: {
            ...initDetailParams,
        },
        detailList: [],
        detailTotal: 0,
        detailCurrent: 1,
        result: {},
    },

    effects: {
        * resetParamsAndQuery({payload}, {call, put, select}) {
            yield put({
                type: 'resetParams',
            })
            yield put({
                type: 'tasks',
                payload: {page: 1},
            })
        },
        * tasks({payload}, {call, put, select}) {
            let params = yield select(({community_automaticGroupMsg}) => community_automaticGroupMsg.params)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }

            const fetchOption = objMomentToTime(params)
            let createStart = ''
            let createEnd = ''
            if(fetchOption.createStart) {
                createStart = `${fetchOption.createStart} 00:00:00`
            }
            if(fetchOption.createEnd) {
                createEnd = `,${fetchOption.createEnd} 23:59:59`
            }
            fetchOption.create_time = `${createStart}${createEnd}`

            let executeStart = ''
            let executeEnd = ''
            if(fetchOption.executeStart) {
                executeStart = `${fetchOption.executeStart} 00:00:00`
            }
            if(fetchOption.executeEnd) {
                executeEnd = `${fetchOption.executeEnd} 23:59:59`
            }
            fetchOption.execute_time = `${executeStart},${executeEnd}`

            const data = yield call(tasks, fetchOption)
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        tasks: data.data,
                        params: params,
                        total: _.get(data, 'pagination.rows_found'),
                        current: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },
        * details({payload}, {call, put, select}) {
            let params = yield select(({community_automaticGroupMsg}) => community_automaticGroupMsg.detailParams)
            params = {...params, ...payload}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(details, parse(params))
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detailList: data.data,
                        detailParams: params,
                        detailTotal: _.get(data, 'pagination.rows_found'),
                        detailCurrent: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },
        * taskResult({payload, callback}, {select, call, put}) {
            const data = yield call(task, parse(payload))
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        result: data.data,
                    },
                })
                callback && callback(data.data)
            }
        },
        * cancelled({payload, callback}, {call, put}) {
            let res = yield call(cancelled, payload)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * reExecute({payload, callback}, {call, put}) {
            let res = yield call(reExecute, payload)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },

        // 明细的数据导出
        * exportTask({payload, callback}, {select, call, put}) {
            let params = yield select(({community_automaticGroupMsg}) => community_automaticGroupMsg.detailParams)
            const res = yield call(exportTask, payload, params)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * exportExcel({payload, callback}, {select, call, put}) {
            const res = yield call(exportExcel, payload)
            callback && callback(res)
        },

        // 群发消息列表的数据导出
        * exportTaskMsg({payload, callback}, {select, call, put}) {
            let params = yield select(({community_automaticGroupMsg}) => community_automaticGroupMsg.params)
            const fetchOption = objMomentToTime(params)
            let createStart = ''
            let createEnd = ''
            if(fetchOption.createStart) {
                createStart = `${fetchOption.createStart} 00:00:00`
            }
            if(fetchOption.createEnd) {
                createEnd = `,${fetchOption.createEnd} 23:59:59`
            }
            fetchOption.create_time = `${createStart}${createEnd}`

            let executeStart = ''
            let executeEnd = ''
            if(fetchOption.executeStart) {
                executeStart = `${fetchOption.executeStart} 00:00:00`
            }
            if(fetchOption.executeEnd) {
                executeEnd = `${fetchOption.executeEnd} 23:59:59`
            }
            fetchOption.execute_time = `${executeStart},${executeEnd}`

            const res = yield call(exportTaskMsg, fetchOption)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },

        // 检查是否有群发次数
        * checkMass({payload, callback}, {call, put}) {
            let res = yield call(checkMass)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback(res.data)
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
        resetParams(state, action) {
            const params = Object.assign({}, initParams)
            return {...state, params}
        },
        resetDetailParams(state, action) {
            const detailParams = Object.assign({}, initDetailParams)
            return {...state, detailParams}
        },
    },
}
