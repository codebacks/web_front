import {list, create, remove, detail} from 'wx/services/material/moments'

const params = {
    limit: 40,
    offset: 0,
}

function getInitParams() {
    return {
        content_desc: undefined, // 内容描述
        user_id: undefined, // 创建人
        content_type: '', // 内容类型
        start_time: undefined,
        end_time: undefined,
    }
}

export default {
    namespace: 'wx_material_moments',

    state: {
        params: getInitParams(),
        allParams: {
            ...params
        },
        allList: [], // 全部
        sentParams: {
            source: 1,
            ...params
        },
        sentList: [], // 已发
        unsentParams: {
            source: 2,
            ...params
        },
        unsentList: [], // 未发

        allTotal: 0,
        sentTotal: 0,
        unsentTotal: 0,

        currentSource: 0,
        clearAll: false,
        updateSource: [],

    },

    effects: {
        * list({payload, callback}, {call, put, select}) {
            const currentSource = yield select(({wx_material_moments}) => wx_material_moments.currentSource)
            let {params, allList, sentList, unsentList} = yield select(({wx_material_moments}) => wx_material_moments)
            let query = {...params, ...payload.params}
            const res = yield call(list, query)
            if (res && res.data) {
                const data = res.data
                const total = res.pagination.rows_found
                let listPayload = {}
                if(currentSource === 0) {
                    listPayload = {
                        allList: query.offset ? allList.concat(data) : data,
                        allParams: payload.params,
                        allTotal: total,
                    }
                } else if(currentSource === 1) {
                    listPayload = {
                        sentList: query.offset ? sentList.concat(data) : data,
                        sentParams: payload.params,
                        sentTotal: total,
                    }
                } else if(currentSource === 2) {
                    listPayload = {
                        unsentList: query.offset ? unsentList.concat(data) : data,
                        unsentParams: payload.params,
                        unsentTotal: total,
                    }
                }

                yield put({
                    type: 'setProperty',
                    payload: {
                        ...listPayload,
                        clearAll: false
                    },
                })
                callback && callback(list)
            }
        },
        * create({payload, callback}, {call}) {
            const res = yield call(create, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * remove({payload, callback}, {call}) {
            const res = yield call(remove, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
        * detail({payload, callback}, {call}) {
            const res = yield call(detail, payload)
            if (res && res.data) {
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
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        }
    },
}
