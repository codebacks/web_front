/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {
    callRecords,
} from 'risk_control/services/devices'
import createModel from 'utils/model'
import _ from 'lodash'
import moment from 'moment'

function getInitParams() {
    return {
        user_id: undefined,
        department_id: undefined,
        type: undefined,
        call_time: [null, null],
        call_duration: [null, null],
        keyword: '',
        limit: 10,
        offset: 0,
        is_marketing: undefined,
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
    namespace: 'risk_control_callRecords',

    state: getInitState(),

    effects: {
        * details({payload, callback}, {select, call, put}) {
            try {
                let {params, current} = yield select(
                    ({risk_control_callRecords}) => risk_control_callRecords,
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

                if (params.call_duration[0]) {
                    query.seconds_start = params.call_duration[0]
                }

                if (params.call_duration[1]) {
                    query.seconds_end = params.call_duration[1]
                }

                delete query.call_duration

                query.is_marketing = params.is_marketing

                const res = yield call(callRecords, query)

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
    },
})
