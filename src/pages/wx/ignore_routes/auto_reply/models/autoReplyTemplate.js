import { query, add, edit, remove, addKeyword, editKeyword, removeCheck } from 'wx/services/autoReply/autoReplyTemplate'
import _ from 'lodash'
import { parse } from 'qs'

function getInitState() {
    return {
        list: [],
        current: 1,
        params: {
            limit: 10,
            offset: 0,
        },
        total: 0,
    }
}

export default {
    namespace: 'wx_autoReplyTemplate',

    state: getInitState(),

    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({wx_autoReplyTemplate}) => wx_autoReplyTemplate.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(query, parse(params))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            }
        },
        * add({payload, callback}, {call, put}) {
            const {meta} = yield call(add, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * edit({payload, callback}, {call, put}) {
            const {meta} = yield call(edit, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * remove({payload, callback}, {call, put}) {
            const {meta} = yield call(remove, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
        * removeCheck({payload, callback}, {call, put}) {
            const {data, meta} = yield call(removeCheck, payload)
            if(data && meta.code === 200) {
                callback && callback(data)
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
    },
}
