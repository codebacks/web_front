import {parse} from 'qs'
import { queryGroupList, batchEditGroupNotice, getGroupDivideOptions, checkMass } from "community/services/groupManagement"
import moment from "moment/moment"

const params = {
    limit: 10,
    offset: 0,
    query: '',
    notice: '',
    department_id: undefined,
    user_id: undefined,
    uin: undefined, // 微信UIN，多个,隔开
    is_owner: 1,
    status: 0,
    grouping_id: undefined, // 群分组
}

const editBody = {
    // notice: '<div><img alt="qq" src="/static/20.d7040b5c.png" data-hz-face="HZQQFaceKey20"></div>',
    notice: undefined,
    chatroom_names: undefined,
    execute_now: 1,
    execute_time: undefined, // '2018-11-30T06:30:43.644Z'
}

export default {
    namespace: 'community_groupNotice',
    state: {
        params: {
            ...params
        },
        editBody: {
            ...editBody
        },
        list: [],
        total: 0,
        current: 1,
        selectedRowKeys: [],
        // selectedRows: null, // 选择的表格行, 编辑单个为{}，编辑多个为[]
        selectedRows: [], // 选择的表格行, 编辑单个为{}，编辑多个为[]
        onlyOne: undefined, // 0：否，1：是 (用于判断选择单个或多个)
        groupDivideOptionsHasAll: [], // 群分组的options

    },
    subscriptions: {},
    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_groupNotice}) => community_groupNotice.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryGroupList, parse(params))
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
        * update({payload, callback}, {select, call, put}) {
            const editBody = yield select(({community_groupNotice}) => community_groupNotice.editBody)
            let editBodyTemp = {...editBody, notice: payload.unFaceNotice}
            if(editBodyTemp.execute_time) {
                editBodyTemp.execute_time = moment(editBodyTemp.execute_time).unix()
            }
            const data = yield call(batchEditGroupNotice, {body: editBodyTemp}, {...payload?.params})
            if (data && data.data) {
                callback && callback(data.data)
            }
        },
        * getGroupDivideOptions({payload, callback}, {select, call, put, all}) {
            const data = yield call(getGroupDivideOptions)
            if(data && data.meta?.code===200) {
                let groupDivideOptionsHasAll = [...data.data]
                groupDivideOptionsHasAll.unshift({id: '', title: '全部分组'})
                yield put({
                    type: 'setProperty',
                    payload: {
                        groupDivideOptionsHasAll
                    },
                })
            }
        },
        // 检查是否有批量修改群公告次数
        * checkMass({payload, callback}, {call, put}) {
            console.log('checkMass')
            let res = yield call(checkMass)
            if(res && res.meta && res.meta.code === 200) {
                callback && callback(res.data)
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
        setEditBody(state, action) {
            let editBody = {...state.editBody, ...action.payload.editBody}
            return {...state, editBody}
        },
        resetEditBody(state, action) {
            return {...state, editBody}
        },
    }
}