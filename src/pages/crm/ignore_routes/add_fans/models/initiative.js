import {list, batchSet } from 'crm/services/addFans/initiative'

function getInitParams() {
    return {
        keyword: '',
        department_id: undefined,
        user_id: undefined,
        remark: '',
        type: undefined, // 类型 1 搜索加粉
        enabled: undefined, // 1启用/禁用0
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
    }
}

export default {
    namespace: 'crm_add_fans_initiative',
    state: getInitState(),
    subscriptions: {},
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let {params} = yield select(({crm_add_fans_initiative}) => crm_add_fans_initiative)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            let query = {...params}
            if (query.type === -1) {
                delete query.type
            }
            const res = yield call(list, query)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1
                    },
                })
                callback && callback(res.data)
            }
        },
        * batchSet({payload, callback}, {call}) {
            const res = yield call(batchSet, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
    },
    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        resetParams(state) {
            return {...state, params: getInitParams()}
        },
    },
}
