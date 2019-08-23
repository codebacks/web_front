import {
    addComment,
    tasks,
    details,
    taskResult,
    commentContent,
} from 'wx/services/automatic/momentsComment'

const params = {
    limit: 10,
    offset: 0,
}

const detailParams = {
    keyword: '',
    status: '',
    limit: 10,
    offset: 0,
}

export default {
    namespace: 'wx_moments_comment',

    state: {
        params: {
            ...params
        },
        tasks: [],
        total: 0,
        current: 1,
        detailParams: {
            ...detailParams
        },
        detailList: [],
        detailTotal: 0,
        detailCurrent: 1,
        result: {},
    },

    effects: {
        * addComment({payload, callback}, {call}) {
            const res = yield call(addComment, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback(res.data)
            }
        },
        * tasks({payload}, {call, put, select}) {
            let params = yield select(({wx_moments_comment}) => wx_moments_comment.params)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(tasks, {id: payload.id, params: params})
            if(res && res.data) {
                const pageInfo = params.is_add ? {
                    total: res.pagination.rows_found,
                    current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1
                } : 0
                yield put({
                    type: 'setProperty',
                    payload: {
                        tasks: res.data,
                        params: params,
                        ...pageInfo
                    },
                })
            }
        },
        * details({payload}, {call, put, select}) {
            let params = yield select(({wx_moments_comment}) => wx_moments_comment.detailParams)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(details, {id: payload.id, params: params})
            if(res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        detailList: res.data,
                        detailParams: params,
                        detailTotal: res.pagination.rows_found,
                        detailCurrent: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }
        },
        * commentContent({payload, callback}, {select, call, put}) {
            const res = yield call(commentContent, payload)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * taskResult({ payload, callback }, { select, call, put }) {
            const res = yield call(taskResult, payload)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        result: res.data,
                    },
                })
                callback && callback(res.data)
            }
        },
    },

    reducers: {
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state) {
            return {...state, params}
        },
        resetDetailParams(state) {
            return {...state, detailParams}
        }
    },
}
