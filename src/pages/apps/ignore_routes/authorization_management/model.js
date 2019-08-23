/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {getGrantApps, grantApps} from 'apps/services/apps'
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
    namespace: 'apps_authorizationManagement',

    state: getInitState(),

    effects: {
        *grantApps({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(grantApps, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            } catch (e) {}
        },

        *details({payload, callback}, {select, call, put}) {
            try {
                let {params, current} = yield select(
                    ({apps_authorizationManagement}) => apps_authorizationManagement,
                )

                params = {...params, ...payload}
                if (payload.page) {
                    params.offset = params.limit * (payload.page - 1)
                }

                const res = yield call(getGrantApps, params)

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
            } catch (e) {
                console.error(e)
            }
        },
    },

    reducers: {
        clearTableList(state) {
            return {...state, list: []}
        },
    },
})
