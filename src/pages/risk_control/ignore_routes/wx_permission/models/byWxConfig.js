/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {
    query,
    wxDivideOptions,
    getPermissionConfig,
    setPermissionConfig,
    getSinglePermission,
    setSinglePermission,
} from 'risk_control/services/byWxConfig'
import createModel from 'utils/model'
import {parse} from 'qs'

function getInitParams() {
    return {
        user_id: undefined,
        department_id: undefined,
        keep_user_id: undefined,
        query: '',
        device_query: '',
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
        selectedRowKeys: [],
        wxDivideOptionsMap: {},
        permissionConfig: [],
        singlePermission: [],
    }
}

export default createModel({
    namespace: 'risk_control_byWxConfig',

    state: getInitState(),

    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({risk_control_byWxConfig}) => risk_control_byWxConfig.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(query, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            }
        },

        * wxDivideOptions({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(wxDivideOptions, {limit: 10000, offset: 0})

                if (meta && meta.code === 200) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            wxDivideOptionsMap: data.reduce((acc, cur) => {
                                acc[cur.group_id] = cur.title
                                return acc
                            }, {}),
                        },
                    })
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * getPermissionConfig({payload, callback}, {select, call, put}) {
            try {
                const res = yield call(getPermissionConfig, payload)
                if (res && res.data) {
                    res.data.forEach((item) => {
                        item.status = 0
                    })
                    yield put({
                        type: 'setProperty',
                        payload: {
                            permissionConfig: res.data,
                        },
                    })
                    callback && callback(res.data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * setPermissionConfig({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(setPermissionConfig, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * getSinglePermission({payload, callback}, {select, call, put}) {
            try {
                const res = yield call(getSinglePermission, payload)
                if (res && res.data) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            singlePermission: res.data,
                        },
                    })
                    callback && callback(res.data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * setSinglePermission({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(setSinglePermission, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

    },

    reducers: {
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
    },
})
