import {
    queryGroupList, querySearchGroupList, addSearchGroupList, switchActivityGroupStatus, queryActivityGroupTop,
    uploadGroupQrcode, autoUploadGroupQrcode, deleteGroup, getAutoUploadQrcodeStatus, setExcludeScanRepeat,
} from 'community/services/groupCode'
import {parse} from "qs"
import _ from 'lodash'
import createModel from 'utils/model'

const params = {
    department_id: undefined,
    user_id: undefined,
    uin: undefined,
    key: '',
    chatroom_status: undefined, // 群状态（0:退出  1:正常）
    invite_confirm_status: undefined, // 邀请确认（ 0 否,  1是）
    activity_chatroom_status: undefined, // 群使用状态（ 1 可用  0 不可用  -1 异常）
    replier_status: undefined, // 回复者状态（未设置  1   异常  2）
    limit: 10,
    offset: 0,
}

const addModalParams = {
    key: '',
    limit: 10,
    offset: 0,
    exclude_activty: undefined, // 是否要排除活动群   0/1
}


export default createModel({
    namespace: 'community_groupCodeGroupList',

    state: {
        params: {
            ...params,
        },
        addModalParams: {
            ...addModalParams
        },
        list: [],
        total: 0,
        current: 1,
        addModalList: [], // 以下为添加群的弹窗
        addModalTotal: 0,
        addModalCurrent: 1,
        selectedRowKeys: [],
        selectedRows: [],
        top: null,
        autoUploadQrcodeStatus: 0, // 自动更新群二维码的状态和时间
        autoUploadQrcodeTtl: 0,
    },

    effects: {
        * query({payload, callback}, {select, call, put}) {
            let params = yield select(({community_groupCodeGroupList}) => community_groupCodeGroupList.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const data = yield call(queryGroupList, payload, parse(params))
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
        * queryModalList({payload, callback}, {select, call, put}) {
            let addModalParams = yield select(({community_groupCodeGroupList}) => community_groupCodeGroupList.addModalParams)
            if (payload.page) {
                addModalParams.offset = addModalParams.limit * (payload.page - 1)
            }
            const data = yield call(querySearchGroupList, parse(addModalParams))
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        addModalList: data.data,
                        addModalParams: addModalParams,
                        addModalTotal: data.pagination.rows_found,
                        addModalCurrent: payload.page === undefined ? 1 : payload.page,
                    }
                })
                callback && callback(data.data)
            }
        },
        * addList({payload, callback}, {select, call, put}) {
            let selectedRows = yield select(({community_groupCodeGroupList}) => community_groupCodeGroupList.selectedRows)
            let newSelectedRows = [...selectedRows]
            newSelectedRows.forEach((item, index) => {
                item.username = item.chatroom_id
                delete item.displayname
                delete item.member_count
                delete item.remark
                delete item.chatroom_id
            })
            const data = yield call(addSearchGroupList, {
                group_activity_id: payload.group_activity_id,
                body: newSelectedRows
            })
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
        * switchActivityGroupStatus({payload, callback}, {select, call, put}) {
            const data = yield call(switchActivityGroupStatus, payload)
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
        * queryActivityGroupTop({payload, callback}, {select, call, put}) {
            const data = yield call(queryActivityGroupTop, payload)
            if (data && data.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        top: data.data,
                    }
                })
                callback && callback(data.data)
            }
        },
        * uploadGroupQrcode({payload, callback}, {select, call, put}) {
            const data = yield call(uploadGroupQrcode, payload)
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
        * autoUploadGroupQrcode({payload, callback}, {select, call, put}) {
            const data = yield call(autoUploadGroupQrcode, payload)
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
        * deleteGroup({payload, callback}, {select, call, put}) {
            const data = yield call(deleteGroup, payload)
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
            }
        },
        * getAutoUploadQrcodeStatus({payload, callback}, {select, call, put}) {
            const data = yield call(getAutoUploadQrcodeStatus, payload)
            if (data && data.data) {
                const { status=0, ttl=0 } = data.data
                yield put({
                    type: 'setProperty',
                    payload: {
                        autoUploadQrcodeStatus: status,
                        autoUploadQrcodeTtl: ttl,
                    }
                })
                callback && callback(data.data)
            }
        },

        * setExcludeScanRepeat({payload, callback}, {select, call, put}) {
            const data = yield call(setExcludeScanRepeat, payload)
            if (data && data.meta?.code===200) {
                callback && callback(data.data)
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
        resetAddModalParams(state, action) {
            return {...state, addModalParams}
        },
    },
})
