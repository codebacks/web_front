/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {
    groups,
    createGroups,
    changeGroups,
    deleteGroups,
} from 'risk_control/services/devices'
import createModel from 'utils/model'
import _ from 'lodash'

function getInitParams() {
    return {
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

export default createModel({
    namespace: 'risk_control_devicesGroups',

    state: getInitState(),

    effects: {
        *changeGroups({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(changeGroups, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            } catch (e) {
                console.error(e)
            }
        },

        *deleteGroups({payload, callback}, {select, call, put}) {
            try {
                const data = yield call(deleteGroups, payload)
                if (data) {
                    callback && callback(data)
                }
            } catch (e) {
                console.error(e)
            }
        },

        *createGroups({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(createGroups, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            } catch (e) {
                console.error(e)
            }
        },

        * details({payload, callback}, {select, call, put}) {
            try {
                let {params, current} = yield select(
                    ({risk_control_devicesGroups}) => risk_control_devicesGroups,
                )

                params = {...params, ...payload}
                if (payload.page) {
                    params.offset = params.limit * (payload.page - 1)
                }

                const res = yield call(groups, params)

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
                console.error(e)
            }
        },
    },

    reducers: {},
})
