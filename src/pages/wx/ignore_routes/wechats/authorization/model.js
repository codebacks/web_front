/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {authNumber} from 'wx/services/wechats'
import createModel from 'utils/model'
import _ from 'lodash'

function getInitParams() {
    return {
        query: '', // 搜索
        status: '', // 执行状态
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
    namespace: 'wx_wxAuthorization',

    state: getInitState(),

    effects: {
        *details({payload, callback}, {select, call, put}) {
            try {
                let {params, current} = yield select(
                    ({wx_wxAuthorization}) => wx_wxAuthorization,
                )

                params = {...params, ...payload}
                if (payload.page) {
                    params.offset = params.limit * (payload.page - 1)
                }

                const res = yield call(authNumber, params)

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
            } catch (e) {}
        },
    },

    reducers: {},
})
