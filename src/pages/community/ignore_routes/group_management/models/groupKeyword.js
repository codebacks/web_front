import {list} from 'community/services/friends/pass'
import _ from "lodash"
import moment from "moment"

function getInitParams() {
    return {
        query: '',
        department_id: undefined,
        user_id: undefined,
        uin: undefined,
        start_time: '',
        end_time: '',
        status: {
            is_passed: undefined, // 已通过
            is_ignored: undefined, // 已忽略
            not_passed: undefined, //  未通过
            not_handled: undefined, // 未处理
            expired: undefined, // 已过期
            is_deleted: undefined, // 已删除
        },
        limit: 10,
        offset: 0
    }
}

function getInitState() {
    return {
        list: [],
        applicationTime: [null, null],
        params: getInitParams(),
        checkedAll: false,
        total: 0,
        current: 1,
    }
}

export default {
    namespace: 'community_groupKeyword',
    state: getInitState(),
    subscriptions: {},
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let {params, applicationTime} = yield select(({community_groupKeyword}) => community_groupKeyword)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            let query = {...params, ...params.status}


            query.start_time = applicationTime[0] ? moment(applicationTime[0]).format('YYYY-MM-DD') + ' 00:00:00' : ''
            query.end_time = applicationTime[1] ? moment(applicationTime[1]).format('YYYY-MM-DD') + ' 23:59:59' : ''
            delete query.status

            const res = yield call(list, query)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(res.data)
            }
        },
    },
    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        assignStateByPath(state, action) {
            const payload = action.payload
            const oldValue = _.get(state, payload.path, {})
            _.set(state, payload.path, Object.assign(oldValue, payload.value))

            return _.cloneDeep(state)
        },
        setStateByPath(state, action) {
            const payload = action.payload
            _.set(state, payload.path, payload.value)

            return _.cloneDeep(state)
        },
        resetState() {
            return getInitState()
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        }
    }
}
