import {
    tasks,
    details,
    taskResult,
    create,
    cancelExecution,
    reExecution,
} from 'crm/services/massMsg/record'
import {parse} from "qs"

const params = {
    limit: 10,
    offset: 0,
    group_id: '', // 分组id
    title: '', // 主题
    group_name: '',
    create_time: '', // 创建时间，逗号隔开
    execute_time: '', // 执行时间，逗号隔开
}

const detailsParams = {
    query: '',
    status: '',
    limit: 10,
    offset: 0,
}

const groupParams = {
    ...params,
}

export default {
    namespace: 'crm_mass_msg_record',

    state: {
        // 群发记录
        params: {
            ...params
        },
        tasks: [],
        total: 0,
        current: 1,

        // 任务详情
        detailsParams: {
            ...detailsParams
        },
        details: [],
        detailsTotal: 0,
        detailsCurrent: 1,
        result: {},

        // 分组群发记录
        groupParams: {
            ...groupParams
        },
        groupTasks: [],
        groupTotal: 0,
        groupCurrent: 1,
    },

    effects: {
        * create({callback, payload}, {call, put, select}) {
            let res = yield call(create, parse(payload.body))
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },

        * tasks({payload}, {select, call, put}) {
            let params = yield select(({crm_mass_msg_record}) => crm_mass_msg_record.params)
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(tasks, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        tasks: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },

        * groupTasks({payload}, {select, call, put}) {
            let params = yield select(({crm_mass_msg_record}) => crm_mass_msg_record.groupParams)
            params = {...params, ...payload}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
                delete params.page
            }
            const data = yield call(tasks, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        groupTasks: data.data,
                        groupParams: params,
                        groupTotal: data.pagination.rows_found,
                        groupCurrent: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },

        * details({payload}, {select, call, put}) {
            let params = yield select(({crm_mass_msg_record}) => crm_mass_msg_record.detailsParams)
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(details, parse({
                id: payload.id,
                query: params
            }))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        details: data.data,
                        detailsParams: params,
                        detailsTotal: data.pagination.rows_found,
                        detailsCurrent: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },
        * taskResult({payload, callback}, {select, call, put}) {
            const data = yield call(taskResult, parse(payload))
            if (data && data.data) {
                let result = {}
                data.data.forEach((item)=>{
                    result[item.status] = item.num
                })
                yield put({
                    type: 'setProperty',
                    payload: {
                        result: result,
                    },
                })
                callback && callback(data.data)
            }
        },
        * cancelExecution({payload, callback}, {call, put}) {
            let res = yield call(cancelExecution, parse(payload))
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * reExecution({payload, callback}, {call, put}) {
            let res = yield call(reExecution, parse(payload))
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
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
            return {...state, params}
        },
        resetGroupParams(state) {
            return {...state, groupParams}
        },
        resetDetailsParams(state) {
            return {...state, detailsParams}
        },
    },
}
