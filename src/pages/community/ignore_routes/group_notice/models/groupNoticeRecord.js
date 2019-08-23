import {parse} from 'qs'
import { getGroupNoticeRecord, getGroupNoticeRecordDetail, cancelExecuteGrouupNotice, reExecuteGrouupNotice } from "community/services/groupManagement"
import moment from "moment/moment"

const params = {
    limit: 10,
    offset: 0,
    query: '',
    notice: '',
    department_id: undefined,
    user_id: undefined,
    uin: undefined, // 微信UIN，多个,隔开
    execute_time_start: '',// moment().subtract(7, 'days').format(DateFormat) + ' 00:00:00',
    execute_time_end: '',// moment().format(DateFormat) + ' 23:59:59',
    task_status: undefined,
}

const modalParams = {
    limit: 10,
    offset: 0,
    status: [], // 状态,可多选，用逗号隔开 （0: '未开始', 1: '已完成', -1: '失败'）
}

export default {
    namespace: 'community_groupNoticeRecord',
    state: {
        params: {
            ...params
        },
        modalParams: {
            ...modalParams
        },
        list: [],
        total: 0,
        current: 1,
        checkedAll: false,
        modalList: [], //下面是用于结果明细弹窗
        modalTotal: 0,
        modalCurrent: 1,
    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_groupNoticeRecord}) => community_groupNoticeRecord.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            // newParams改变了原有的params，用于parse参数
            let newParams = {...params}
            if(newParams.execute_time_start && newParams.execute_time_end) {
                newParams.execute_time = `${newParams.execute_time_start},${newParams.execute_time_end}`
            }
            delete newParams['execute_time_start']
            delete newParams['execute_time_end']
            const data = yield call(getGroupNoticeRecord, parse(newParams))
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
        * queryDetailList({payload, callback}, {select, call, put}) {
            let modalParams = yield select(({community_groupNoticeRecord}) => community_groupNoticeRecord.modalParams)
            modalParams = {...modalParams, ...payload.modalParams}
            if (payload.page) {
                modalParams.offset = modalParams.limit * (payload.page - 1)
            }
            // newModalParams改变了原有的modalParams，用于parse参数
            let newModalParams = { ...modalParams, status: modalParams.status.join(',')}
            const data = yield call(getGroupNoticeRecordDetail, parse(newModalParams), payload)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        modalList: data.data,
                        modalParams: modalParams,
                        modalTotal: data.pagination.rows_found,
                        modalCurrent: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            }
        },
        * cancelExecute({payload, callback}, {select, call, put}) {
            const data = yield call(cancelExecuteGrouupNotice, payload)
            if (data && data.data) {
                callback && callback(data.data)
            }
        },
        * reExecute({payload, callback}, {select, call, put}) {
            const data = yield call(reExecuteGrouupNotice, payload)
            if (data) {
                console.log('重新执行成功')
                callback && callback(data.data)
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload.params}
            return {...state, params}
        },
        resetParams(state, action) {
            return {...state, params}
        },
        resetModalParams(state, action) {
            return {...state, modalParams}
        },
    }
}