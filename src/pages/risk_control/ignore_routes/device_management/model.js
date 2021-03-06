/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {
    devices,
    updateDevices,
    devicesAttributes,
    groupsAll,
    removeDevices,
    devicesLogin,
    devicesQrcode,
    devicesResult,
    batchGroup,
    switchUser,
    notificationsBatch,
    notifications,
    getPermissionConfig,
    setPermissionConfig,
    getSinglePermission,
    setSinglePermission,
} from 'risk_control/services/devices'
import createModel from 'utils/model'
import _ from 'lodash'

function getInitParams() {
    return {
        keep_user_id: undefined,
        department_id: undefined,
        group_id: undefined,
        is_online: undefined,
        is_active: undefined,
        is_delete: '0',
        wechat_version: undefined,
        niukefu_version: undefined,
        rom_version: undefined,
        hook_version: undefined,
        os: undefined,
        brand: undefined,
        model: undefined,
        keyword: '',
        wechat_keyword: '',
        limit: 10,
        offset: 0,
    }
}

function getInitState() {
    return {
        wechatVersionMap: {},
        niukefuVersionMap: {},
        romVersionMap: {},
        hookVersionMap: {},
        osMap: {},
        brandMap: {},
        modelMap: {},
        list: [],
        selectedRowKeys: [],
        groupsAllOptionsMap: {},
        params: getInitParams(),
        total: 0,
        current: 1,
        permissionConfig: [],
        singlePermission: [],
    }
}

export default createModel({
    namespace: 'risk_control_deviceManagement',

    state: getInitState(),

    effects: {
        * notifications({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(notifications, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * notificationsBatch({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(notificationsBatch, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * switchUser({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(switchUser, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * batchGroup({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(batchGroup, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * devicesResult({payload, callback}, {select, call, put}) {
            try {
                const response = yield call(devicesResult, payload)

                callback && callback(response)
            }catch (e) {
                console.error(e)
                callback && callback()
            }
        },

        * devicesQrcode({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(devicesQrcode, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * devicesLogin({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(devicesLogin, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

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
                            }, {0: '未分组'}),
                        },
                    })
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * devicesAttributes({payload, callback}, {select, call, put}) {
            try {
                const {meta, data = {}} = yield call(devicesAttributes, payload)

                if (meta && meta.code === 200) {
                    const {
                        wechat_version = [],
                        niukefu_version = [],
                        rom_version = [],
                        hook_version = [],
                        os = [],
                        brand = [],
                        model = [],
                    } = data

                    yield put({
                        type: 'setProperty',
                        payload: {
                            wechatVersionMap: wechat_version.reduce((acc, cur) => {
                                acc[cur] = cur
                                return acc
                            }, {}),
                            niukefuVersionMap: niukefu_version.reduce((acc, cur) => {
                                acc[cur] = cur
                                return acc
                            }, {}),
                            romVersionMap: rom_version.reduce((acc, cur) => {
                                acc[cur] = cur
                                return acc
                            }, {}),
                            hookVersionMap: hook_version.reduce((acc, cur) => {
                                acc[cur] = cur
                                return acc
                            }, {}),
                            osMap: os.reduce((acc, cur) => {
                                acc[cur] = cur
                                return acc
                            }, {}),
                            brandMap: brand.reduce((acc, cur) => {
                                acc[cur] = cur
                                return acc
                            }, {}),
                            modelMap: model.reduce((acc, cur) => {
                                acc[cur] = cur
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

        * removeDevices({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(removeDevices, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * updateDevices({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(updateDevices, payload)

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
                    ({risk_control_deviceManagement}) => risk_control_deviceManagement,
                )

                params = {...params, ...payload}
                if (payload.page) {
                    params.offset = params.limit * (payload.page - 1)
                }

                let query = {...params}

                const res = yield call(devices, query)

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
        clearSelectedRowKeys(state, action) {
            return {...state, selectedRowKeys: []}
        },
    },
})
