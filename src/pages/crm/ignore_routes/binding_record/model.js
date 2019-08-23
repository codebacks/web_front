/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/28
 */

import {members} from 'crm/services/shoppingPlatform'
import createModel from 'utils/model'
import _ from 'lodash'
import moment from 'moment'

function getInitParams() {
    return {
        remark: '',
        status: '',
        platform: '',
        create_time: [null, null],
        friend: '',
        from_uin: '',
        limit: 10,
        department_id: undefined,
        user_id: undefined,
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
    namespace: 'crm_bindingRecord',

    state: getInitState(),

    effects: {
        * details({payload, callback}, {select, call, put}) {
            try {
                let {params, current} = yield select(
                    ({crm_bindingRecord}) => crm_bindingRecord,
                )

                params = {...params, ...payload}
                if (payload.page) {
                    params.offset = params.limit * (payload.page - 1)
                }

                let query = {...params}

                if (params.create_time[0]) {
                    query.create_time_from = `${moment(params.create_time[0]).format('YYYY-MM-DD')} 00:00:00`
                }

                if (params.create_time[1]) {
                    query.create_time_to = `${moment(params.create_time[1]).format('YYYY-MM-DD')} 23:59:59`
                }

                delete query.create_time

                const res = yield call(members, query)

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
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
    },
})
