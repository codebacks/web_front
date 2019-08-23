import {parse} from 'qs'
import {
    query,
    remove,
    result,
    login,
    switchUser,
    stat,
    update,
    notifications,
    getWechatDivideOptions,
    setWechatDivide,
    batchSetReplyConfig,
    batchSwitchUser,
    settingAutoReplyTemplates,
    getAllUsers,
} from 'wx/services/wechats'
import {querySummary} from 'services/users'
import {exitsCount, search} from "community/services/mass"
import {sentSms} from 'services/sms'

const params = {
    query: '',
    department_id: undefined,
    user_id: undefined,
    remark: '', // 备注
    online: '', // 在线状态
    offset: 0,
    limit: 10,
    group_id: undefined, // 分组id: -1为全部，传参时去掉
}

export default {
    namespace: 'wx_wechats',
    state: {
        list: [],
        params: {
            ...params,
        },
        usersSummary: [],
        total: 0,
        current: 1,
        loading: false,
        stat: {},
        loginModal: false,
        updateLoading: false,
        wechatDivideOptionsHasAll: [], // 分组的options
        wechatDivideOptions: [],
        selectedRowKeys: [],
        templates: [],
        allUsers: [],
        indeterminate: false,
        checkAll: false,
    },
    subscriptions: {
        setup({dispatch, history}) {
        },
    },

    effects: {
        * settingAutoReplyTemplates({payload, callback}, {select, call, put}) {
            try {
                const {data} = yield call(settingAutoReplyTemplates, {
                    offset: 0,
                    limit: 1000,
                })

                if (data) {
                    yield put({
                        type: 'setProperty',
                        payload: {
                            templates: data,
                        },
                    })
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * batchSwitchUser({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(batchSwitchUser, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * batchSetReplyConfig({payload, callback}, {select, call, put}) {
            try {
                const {meta, data} = yield call(batchSetReplyConfig, payload)

                if (meta && meta.code === 200) {
                    callback && callback(data)
                }
            }catch (e) {
                console.error(e)
            }
        },

        * queryUsersSummary({payload, callback}, {select, call, put}) {
            const data = yield call(querySummary, parse(payload.params))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        usersSummary: data.data,
                    },
                })
            }
        },
        * query({payload}, {select, call, put, all}) {
            yield put({type: 'setProperty', payload: {loading: true}})
            let params = yield select(({wx_wechats}) => wx_wechats.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            // group_id: -1，传参时去掉
            let tempParams = {...params}
            if(tempParams['group_id'] === -1) {delete tempParams['group_id']}

            const [
                {data: allUsers},
                data,
            ] = yield all([
                call(getAllUsers),
                yield call(query, parse(params)),
            ])

            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page,
                    },
                })
            }

            if (allUsers) {
                const newSelectedRowKeys = []
                const selectedRowKeys = yield select(({wx_wechats}) => wx_wechats.selectedRowKeys)
                selectedRowKeys.forEach((key) => {
                    if (allUsers.findIndex((item) => {
                        return item.id === key
                    }) > -1) {
                        newSelectedRowKeys.push(key)
                    }
                })

                yield put({
                    type: 'setProperty',
                    payload: {
                        allUsers,
                        selectedRowKeys: newSelectedRowKeys,
                    },
                })
            }

            yield put({
                type: 'setAllChecked',
            })

            yield put({type: 'setProperty', payload: {loading: false}})
        },

        * result({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {resultLoading: true}})
            const res = yield call(result, parse(payload))
            callback && callback(res)
            yield put({type: 'setProperty', payload: {resultLoading: false}})
        },

        * login({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {resultLoading: true}})
            const data = yield call(login, parse(payload))
            if (data && data.data) {
                callback && callback(data.data)
            }
            yield put({type: 'setProperty', payload: {resultLoading: false}})
        },

        * remove({payload, callback}, {select, call, put}) {
            const res = yield call(remove, payload)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },

        * switchUser({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {switchLoading: true}})
            const data = yield call(switchUser, parse(payload))
            if (data && data.data) {
                callback && callback()
            }
            yield put({type: 'setProperty', payload: {switchLoading: false}})
        },

        * update({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {updateLoading: true}})
            const data = yield call(update, payload)
            if (data && data.data) {
                callback && callback(data.data)
            }
            yield put({type: 'setProperty', payload: {updateLoading: false}})
        },

        * queryStat({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {statLoading: true}})
            const data = yield call(stat)
            if (data && data.data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        stat: data.data
                    },
                })

                callback && callback(data.data)
            }
            yield put({type: 'setProperty', payload: {statLoading: false}})
        },

        * getDivideOptions({payload}, {select, call, put, all}) {
            const divideData = yield call(getWechatDivideOptions, {limit: 10000, offset: 0})
            if(divideData && divideData.meta?.code===200) {
                let divileList = [{group_id: 0, title: '未分组'}, ...divideData.data]
                let wechatDivideOptionsHasAll = divileList.map((item) => {
                    return {id: item.group_id, ...item}
                })
                let wechatDivideOptions = [...wechatDivideOptionsHasAll]
                wechatDivideOptionsHasAll.unshift({id: -1, title: '全部分组'})
                yield put({
                    type: 'setProperty',
                    payload: {
                        wechatDivideOptionsHasAll,
                        wechatDivideOptions: wechatDivideOptions
                    },
                })
            }
        },

        * notifications({payload, callback}, {call, put}) {
            yield call(notifications, parse(payload))
            if (callback) {
                callback()
            }
        },

        * setWechatDivide({payload, callback}, {call, put}) {
            const data = yield call(setWechatDivide, payload)
            if(data && data?.meta?.code === 200) {
                callback && callback(data.data)
            }
        },
        * sentSms({payload, callback}, {select, call, put}) {
            const {meta} = yield call(sentSms, payload)
            if(meta && meta.code === 200) {
                callback && callback()
            }
        },
    },

    reducers: {
        setAllChecked(state, action) {
            const selectedRowKeys = state.selectedRowKeys
            const allUsers = state.allUsers
            const len = selectedRowKeys.length
            let indeterminate = false
            let checkAll = false

            if (len === 0) {
                checkAll = false
                indeterminate = false
            }else if (len === allUsers.length) {
                checkAll = true
                indeterminate = false
            }else {
                checkAll = false
                indeterminate = true
            }

            return {...state, ...{indeterminate, checkAll}}
        },
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        },
        resetParams(state, action) {
            return {...state, params}
        },
    },

}
