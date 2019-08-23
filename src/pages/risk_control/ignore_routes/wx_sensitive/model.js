/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {
    wxSensitiveWord,
    createWxSensitiveWord,
    changeWxSensitiveWord,
    deleteWxSensitiveWord,
    changeWxSensitiveOperationStatus,
} from 'risk_control/services/devices'
import createModel from 'utils/model'
import _ from 'lodash'

function getInitParams() {
    return {
        limit: 10,
        offset: 0,
        sensitive_word: '',
        behavior_type: undefined,
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
    namespace: 'risk_control_wxSensitive',

    state: getInitState(),

    effects: {
        *changeWxSensitiveOperationStatus({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(changeWxSensitiveOperationStatus, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            } catch (e) {
                console.error(e)
            }
        },

        *changeWxSensitiveWord({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(changeWxSensitiveWord, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            } catch (e) {
                console.error(e)
            }
        },

        *deleteWxSensitiveWord({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(deleteWxSensitiveWord, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            } catch (e) {
                console.error(e)
            }
        },

        *createWxSensitiveWord({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(createWxSensitiveWord, payload)

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
                    ({risk_control_wxSensitive}) => risk_control_wxSensitive,
                )

                params = {...params, ...payload}
                if (payload.page) {
                    params.offset = params.limit * (payload.page - 1)
                }

                const res = yield call(wxSensitiveWord, params)

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

    reducers: {
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
    },
})
