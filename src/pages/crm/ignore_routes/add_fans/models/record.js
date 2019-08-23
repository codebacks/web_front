import {list} from 'crm/services/addFans/record'

function getInitParams() {
    return {
        uin: undefined,
        keyword: '',
        platform_type: '',
        shop_id: '',
        status: '',
        create_time_start: '',
        create_time_end: '',
        data_from: undefined,
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
    namespace: 'crm_add_fans_record',
    state: getInitState(),
    subscriptions: {},
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let {params} = yield select(({crm_add_fans_record}) => crm_add_fans_record)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            let query = {...params, ...{ platform_type: payload.platform_type }}
            const res = yield call(list, query)
            if(res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1,
                    },
                })
                callback && callback(res.data)
            }
        },
        * singleRecordList({payload, callback}, {select, call, put}) {
            let query = {...payload.params, ...{platform_type: payload.platform_type}}
            const res = yield call(list, query)
            if (res && res.data) {
                callback && callback(res)
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
