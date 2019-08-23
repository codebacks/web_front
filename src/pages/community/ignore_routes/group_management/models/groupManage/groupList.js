import {parse} from 'qs'
import {
    queryGroupList,
    groupDetail,
    updateGroup as update,
    groupListStatistics,
    getGroupDivideOptions,
    setGroupDivide,
    exportTask,
    exportStatus,
    getAllUsers,
    checkWorkGroup,
    setWorkGroup,
} from "community/services/groupManagement"

const params = {
    create_time_start: '',// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    create_time_end: '',// moment().format(DateFormat) + ' 23:59:59',
    limit: 10,
    offset: 0,
    query: '',
    department_id: undefined,
    user_id: undefined,
    uin: undefined, // 微信UIN，多个,隔开
    is_sync: undefined, // 0否，1是
    status: '0', // 默认'0'正常
    is_owner: undefined,
    replier_status: undefined, // 回复者状态
    order_by: '-create_time', // 排序字段，字段名，前面加-降序，不加升序，（默认创建时间降序）
    grouping_id: undefined, // 群分组
}

const autoPullRecordParams = {
    limit: 10,
    offset: 0,
    query: '',
    status: '', // 0否，1是
    create_time_start: '',// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    create_time_end: '',// moment().format(DateFormat) + ' 23:59:59',
}

const checkAllParams = {
    selectedRowKeys: [], // item格式：'${record.from.uin},${record.target.username}'
    indeterminate: false,
    checkAll: false,
}

const workGroupInfo = {
    checkWorkGroupInfo: undefined,
    isSetWorkGroup: undefined,
}

export default {
    namespace: 'community_group_management',
    state: {
        params: {
            ...params,
        },
        autoPullRecordParams: {
            ...autoPullRecordParams,
        },
        list: [],
        total: 0,
        current: 1,
        groupDivideOptionsHasAll: [], // 群分组的options
        groupDivideOptions: [],
        autoPullList: [], // 以下为autoPull
        autoPullTotal: 0,
        autoPullCurrent: 1,
        allUsers: [],
        ...checkAllParams, // 全选
        workGroupInfo: { // 设置工作群
            ...workGroupInfo,
        },
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put, all}) {
            let params = yield select(({community_group_management}) => community_group_management.params)
            params = {...params, ...payload.params}
            if(payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            // newParams改变了原有的params，用于parse参数
            let newParams = {...params}
            if(newParams.create_time_start && newParams.create_time_end) {
                newParams.create_time = `${newParams.create_time_start},${newParams.create_time_end}`
            }
            delete newParams['create_time_start']
            delete newParams['create_time_end']

            const data = yield call(queryGroupList, parse(newParams))

            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: data.data,
                        params: params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page,
                    },
                })
                callback && callback(data.data)
            }
        },
        * getAllUsers({payload, callback}, {select, call, put, all}) {
            let params = yield select(({community_group_management}) => community_group_management.params)
            // newParams改变了原有的params，用于parse参数
            let newParams = {...params}
            if(newParams.create_time_start && newParams.create_time_end) {
                newParams.create_time = `${newParams.create_time_start},${newParams.create_time_end}`
            }
            delete newParams['create_time_start']
            delete newParams['create_time_end']

            const {data: allUsers} = yield call(getAllUsers, parse(newParams))

            if (allUsers) {
                const newSelectedRowKeys = []
                const selectedRowKeys = yield select(({community_group_management}) => community_group_management.selectedRowKeys)
                selectedRowKeys.forEach((key) => {
                    if (allUsers.findIndex((item) => {
                        return `${item.uin},${item.chatroomname}` === key
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
            callback && callback()
        },

        * groupDetail({payload, callback}, {select, call, put}) {
            let list = yield select(({community_group_management}) => community_group_management.list)
            const data = yield call(groupDetail, payload)
            if(data && data.data) {
                const { uin, username, index } = payload
                list.splice(index, 1, data.data)
                yield put({
                    type: 'setProperty',
                    payload: {list},
                })
                callback && callback(data.data)
            }
        },
        * statisticsAndGroupDivideOptions({payload, callback}, {select, call, put, all}) {
            const [
                statisticsData,
                groupDivideData,
            ] = yield all([
                call(groupListStatistics),
                call(getGroupDivideOptions),
            ])
            if(statisticsData && statisticsData.meta?.code===200) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        ...statisticsData.data
                    },
                })
            }
            if(groupDivideData && groupDivideData.meta?.code===200) {
                let groupDivideOptionsHasAll = [...groupDivideData.data]
                groupDivideOptionsHasAll.unshift({id: '', title: '全部分组'})
                yield put({
                    type: 'setProperty',
                    payload: {
                        groupDivideOptionsHasAll,
                        groupDivideOptions: groupDivideData.data,
                    },
                })
            }
        },
        * update({payload, callback}, {call, put}) {
            const data = yield call(update, payload)
            if(data && data?.meta?.code === 200) {
                callback && callback(data.data)
            }
        },
        * setGroupDivide({payload, callback}, {call, put}) {
            const data = yield call(setGroupDivide, payload)
            if(data && data?.meta?.code === 200) {
                callback && callback(data.data)
            }
        },
        * exportTask({payload, callback}, {select, call, put}) {
            let params = yield select(({community_group_management}) => community_group_management.params)
            const res = yield call(exportTask, params)
            if (res && res.data) {
                callback && callback(res.data)
            }
        },
        * exportStatus({payload, callback}, {select, call, put}) {
            const res = yield call(exportStatus, payload)
            callback && callback(res)
        },
        * checkWorkGroup({payload, callback}, {select, call, put}) {
            let workGroupInfo = yield select(({community_group_management}) => community_group_management.workGroupInfo)

            const data = yield call(checkWorkGroup, payload)
            if(data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        workGroupInfo: {
                            ...workGroupInfo,
                            checkWorkGroupInfo: data.data,
                        }
                    },
                })
                callback && callback(data.data)
            }
        },
        * setWorkGroup({payload, callback}, {call, put}) {
            const data = yield call(setWorkGroup, payload)
            if(data) {
                callback && callback(data)
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
        resetAutoPullParams(state, action) {
            return {...state, autoPullRecordParams}
        },
        resetCheckAllParams(state, action) {
            return {...state, ...checkAllParams}
        },
        resetWorkGroupInfo(state, action) {
            return {...state, workGroupInfo: {...workGroupInfo}}
        },
    },
}
