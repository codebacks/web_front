/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {
    wxSensitiveOperationStatus,
    changeWxSensitiveOperationStatus,
} from 'risk_control/services/devices'
import createModel from 'utils/model'

function getInitParams() {
    return {
        name: '',
        status: undefined,
    }
}

function getInitState() {
    return {
        data: [],
        list: [],
        params: getInitParams(),
    }
}

export default createModel({
    namespace: 'risk_control_sensitiveOperations',

    state: getInitState(),

    effects: {
        * changeWxSensitiveOperationStatus({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(changeWxSensitiveOperationStatus, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * details({payload, callback}, {select, call, put}) {
            try {
                const res = yield call(wxSensitiveOperationStatus)

                if (res && res.data) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            data: res.data,
                        },
                    })

                    yield put({
                        type: 'search',
                    })

                    callback && callback(res.data)
                }
            }catch (e) {
                console.error(e)
            }
        },
    },

    reducers: {
        search(state, action) {
            const {name, status} = state.params
            const list = state.data.filter((item) => {
                let statusType = true

                if (status !== undefined) {
                    statusType = Number(item.status) === Number(status)
                }

                return item.name.indexOf(name) > -1 && statusType
            })

            return {...state, list}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
    },
})
