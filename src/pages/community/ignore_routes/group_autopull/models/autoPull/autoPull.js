import {parse} from 'qs'
import { queryAutoPull, setAutoPull, deteleAutoPull, queryAddWechatModal, setAddWechatModal,
    addKeyword, removeKeyword, getGroupDivideOptions,
} from "community/services/autoPull"

const params = {
    limit: 10,
    offset: 0,
    query: undefined,
    department_id: undefined,
    user_id: undefined,
    status: undefined,
}
const addWechatParams = {
    limit: 10,
    offset: 0,
    query: undefined,
    department_id: undefined,
    user_id: undefined,
}

export default {
    namespace: 'community_autoPull',
    state: {
        params: {
            ...params
        },
        list: [],
        total: 0,
        current: 1,
        // 添加微信号弹窗
        addWechatParams: {
            ...addWechatParams
        },
        addWechatList: [],
        addWechatTotal: 0,
        addWechatCurrent: 1,
        selectedRowKeys: [],
        selectedRows: [],
        groupDivideOptionsHasAll: [], // 群分组的options
    },
    subscriptions: {},
    effects: {
        * getGroupDivideOptions({payload, callback}, {select, call, put, all}) {
            const data = yield call(getGroupDivideOptions)
            if(data && data.meta?.code===200) {
                let groupDivideOptionsHasAll = [...data.data]
                groupDivideOptionsHasAll.unshift({id: '', title: '全部分组'})
                yield put({
                    type: 'setProperty',
                    payload: {
                        groupDivideOptionsHasAll,
                    },
                })
            }
        },
        // 配置群的modal，单独在autoPullModal.js中
        * queryAutoPull({payload, callback}, {select, call, put}) {
            let params = yield select(({community_autoPull}) => community_autoPull.params)
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(queryAutoPull, parse(params))
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
        * setAutoPull({payload, callback}, {select, call, put}) {
            const res = yield call(setAutoPull, payload)
            if(res.data) {
                callback && callback(res)
            }
        },
        * deteleAutoPull({payload, callback}, {select, call, put}) {
            const res = yield call(deteleAutoPull, payload)
            if(res && res?.meta?.code === 200) {
                callback && callback(res)
            }
        },
        // 新增/删除 关键字
        * addKeyword({payload, callback}, {select, call, put}) {
            const res = yield call(addKeyword, payload)
            if(res && res?.meta?.code === 200) {
                callback && callback(res)
            }
        },
        * removeKeyword({payload, callback}, {select, call, put}) {
            const res = yield call(removeKeyword, payload)
            if(res && res?.meta?.code === 200) {
                callback && callback(res)
            }
        },

        // 添加微信号弹窗
        * queryAddWechatModal({payload, callback}, {select, call, put}) {
            let addWechatParams = yield select(({community_autoPull}) => community_autoPull.addWechatParams)
            if (payload.page) {
                addWechatParams.offset = addWechatParams.limit * (payload.page - 1)
            }
            const res = yield call(queryAddWechatModal, parse(addWechatParams))
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        addWechatList: res.data,
                        addWechatParams: addWechatParams,
                        addWechatTotal: res.pagination.rows_found,
                        addWechatCurrent: payload.page === undefined ? 1 : payload.page,
                        selectedRowKeys: [],
                        selectedRows: [],
                    }
                })
                callback && callback(res.data)
            }
        },
        * setAddWechatModal({payload, callback}, {select, call, put}) {
            const res = yield call(setAddWechatModal, payload)
            if(res?.meta?.code === 200) {
                callback && callback(res)
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
            return {...state, params}
        },
        // 添加微信号弹窗
        setWechatParams(state, action) {
            let addWechatParams = {...state.addWechatParams, ...action.payload.addWechatParams}
            return {...state, addWechatParams}
        },
        resetAddWechatParams(state, action) {
            return {...state, addWechatParams}
        },
    }
}