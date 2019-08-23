import {create, detail, update, list} from 'crm/services/addFans/template'

function getInitParams() {
    return {
        title: '',
        enabled: undefined, //  1启用 0禁用
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
        listSummary: []
    }
}

export default {
    namespace: 'crm_add_fans_template',
    state: getInitState(),
    subscriptions: {},
    effects: {
        * create({payload, callback}, {call, put}) {
            const data = yield call(create, payload)
            if(data && data.meta && data.meta.code === 200) {
                callback && callback()
            }
        },
        * detail({payload, callback}, {call, put}) {
            const res = yield call(detail, payload)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * update({payload, callback}, { select, call, put}){
            const data = yield call(update, payload)
            if(data && data.meta && data.meta.code === 200) {
                callback && callback()
            }
        },
        * list({payload, callback}, {select, call, put}) {
            let {params} = yield select(({crm_add_fans_template}) => crm_add_fans_template)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            let query = {...params}
            if (query.enabled === '') {
                delete query.enabled
            }
            const res = yield call(list, query)
            if(res && res.data) {
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
        * listSummary({payload, callback}, {select, call, put}) {
            const res = yield call(list, {limit: 1000, enabled: 1})
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        listSummary: res.data,
                    },
                })
                callback && callback(res.data)
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
