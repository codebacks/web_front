/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {
    wxSensitiveOperationRecords,
    changeWxSensitiveOperationRecords,
    wxSensitiveOperationAllRecords,
    wxDivideOptions,
    groupsAll,
} from 'risk_control/services/devices'
import createModel from 'utils/model'
import _ from 'lodash'
import moment from 'moment'

function getInitParams() {
    return {
        user_id: undefined,
        department_id: undefined,
        status: undefined,
        handle_status: undefined,
        uin: undefined,
        target_type: undefined,
        operate_status: undefined,
        device_group_id: undefined,
        device_belong_user_id: undefined,
        group_id: undefined,
        sensitive_operation_id: undefined,
        call_time: [null, null],
        key: '',
        limit: 10,
        offset: 0,
    }
}

function getInitState() {
    return {
        allOperationsMap: {},
        groupsAllOptionsMap: {},
        list: [],
        selectedRowKeys: [],
        wxDivideOptionsMap: {},
        params: getInitParams(),
        total: 0,
        current: 1,
    }
}

export default createModel({
    namespace: 'risk_control_sensitiveBehavior',

    state: getInitState(),

    effects: {
        * groupsAll({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(groupsAll, {limit: 10000, offset: 0})

                if (meta && meta.code === 200) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            groupsAllOptionsMap: data.reduce((acc, cur) => {
                                acc[cur.id] = cur.name
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

        * wxSensitiveOperationAllRecords({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(wxSensitiveOperationAllRecords, payload)

                if (meta && meta.code === 200) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            allOperationsMap: data,
                        },
                    })
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * changeWxSensitiveOperationRecords({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(changeWxSensitiveOperationRecords, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * details({payload, callback}, {select, call, put}) {
            try {
                let {params, current} = yield select(
                    ({risk_control_sensitiveBehavior}) => risk_control_sensitiveBehavior,
                )

                params = {...params, ...payload}
                if (payload.page) {
                    params.offset = params.limit * (payload.page - 1)
                }

                let query = {...params}

                if (params.call_time[0]) {
                    query.start_time = `${moment(params.call_time[0]).format('YYYY-MM-DD')} 00:00:00`
                }

                if (params.call_time[1]) {
                    query.end_time = `${moment(params.call_time[1]).format('YYYY-MM-DD')} 23:59:59`
                }

                delete query.call_time

                const res = yield call(wxSensitiveOperationRecords, query)

                if (res && res.data) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            list: res.data,
                            params: params,
                            total: _.get(res, 'pagination.rows_found'),
                            current: payload.page === undefined ? current : payload.page,
                        },
                    })

                    callback && callback(res.data)
                }
            }catch (e) {
                console.log(e)
            }
        },
    },

    reducers: {
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
        clearSelectedRowKeys(state, action) {
            const selectedRowKeys = state.selectedRowKeys
            const removeSelectedRowKeys = action.payload

            const newSelectedRowKeys = selectedRowKeys.filter((item) => {
                return removeSelectedRowKeys.indexOf(item) === -1
            })

            return {...state, selectedRowKeys: newSelectedRowKeys}
        },
    },
})
