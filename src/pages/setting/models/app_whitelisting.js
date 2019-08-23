import {list, check, allow, operate} from 'setting/services/app_whitelisting'

const params = {
    limit: 10,
    offset: 0,
    app_name: undefined,
    status: '', // 0关闭 1开启 2 禁止卸载
}

export default {
    namespace: 'setting_app_whitelisting',

    state: {
        params: {
            ...params,
        },
        list: [],
        total: 0,
        current: 1,
    },

    effects: {
        * list({payload, callback}, {select, call, put}) {
            let params = yield select(({setting_app_whitelisting}) => setting_app_whitelisting.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(list, params)
            if(res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1
                    }
                })
            }
        },
        * check({payload, callback}, {select, call, put}) {
            const res = yield call(check)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * allow({payload, callback}, {select, call, put}) {
            const res = yield call(allow, payload)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * operate({payload, callback}, {select, call, put}) {
            const res = yield call(operate, payload)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        }
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            return {
                ...state, ...{
                    params: {
                        ...state.params,
                        ...action.payload,
                    },
                },
            }
        },
    },
}
