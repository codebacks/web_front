/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {
    getWxConigSummary,
    query,
    moveOut,
    addPermissionWechat,
} from 'risk_control/services/byPermissionConfig'
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
        configKey: undefined, // 左侧类菜单-微信权限类型（当前选中的key）
        configKeyArr: [], // 左侧类菜单-微信权限类型
        list: [],
        params: getInitParams(),
        total: 0,
        current: 1,
        selectedRowKeys: [],
    }
}

export default createModel({
    namespace: 'risk_control_byPermissionConfig',

    state: getInitState(),

    effects: {

        * getWxConigSummary({payload, callback}, {select, call, put}) {
            try {
                let configKey = yield select(({risk_control_byPermissionConfig}) => risk_control_byPermissionConfig.configKey)

                const res = yield call(getWxConigSummary)
                if (res && res.data) {
                    if(!res.data.length) {
                        configKey = undefined
                    }else if(!configKey){
                        configKey = res.data[0]?.key
                    }

                    yield put({
                        type: 'setProperty',
                        payload: {
                            configKey: configKey,
                            configKeyArr: res.data,
                        },
                    })
                    callback && callback(res.data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({risk_control_byPermissionConfig}) => risk_control_byPermissionConfig.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(query, {configKey: payload.configKey}, parse(params))
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

        * moveOut({payload, callback}, {select, call, put}) {
            try {
                const res = yield call(moveOut, payload)
                if (res && res.meta.code === 200) {
                    callback && callback()
                }
            }catch (e) {
                console.error(e)
            }
        },

        * addPermissionWechat({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(addPermissionWechat, payload)

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
        clearSelectedRowKeys(state, action) {
            return {...state, selectedRowKeys: []}
        },
    },
})
