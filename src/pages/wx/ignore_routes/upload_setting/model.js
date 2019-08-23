import {list, wxDivideOptions, batchSet} from "wx/services/uploadSetting"

function getInitParams() {
    return {
        limit: 10,
        offset: 0,
        query: undefined,
        department_id: undefined,
        user_id: undefined,
        group_id: undefined,
        private_chat: undefined,
        room_chat: undefined,
    }
}

export default {
    namespace: 'wx_upload_setting',
    state: {
        params: getInitParams(),
        list: [],
        total: 0,
        current: 1,
        selectedRowKeys: [],
        wxDivideOptionsHasAll: []
    },
    subscriptions: {},
    effects: {
        * list({payload, callback}, {select, call, put}) {
            let params = yield select(({wx_upload_setting}) => wx_upload_setting.params)
            params = {...params, ...payload.params}
            if (payload.page) {
                params.offset = params.limit * (payload.page - 1)
            }
            const res = yield call(list, params)
            if (res && res.data) {
                yield put({
                    type: 'setProperty',
                    payload: {
                        list: res.data,
                        params: params,
                        total: res.pagination.rows_found,
                        current: parseInt(res.pagination.offset / res.pagination.limit, 10) + 1
                    }
                })
                callback && callback(res.data)
            }
        },
        * wxDivideOptions({payload}, {select, call, put}) {
            const divideData = yield call(wxDivideOptions, {limit: 10000, offset: 0})
            if (divideData && divideData.meta?.code === 200) {
                let groupList = [{group_id: 0, title: '未分组'}, ...divideData.data]
                let wxDivideOptionsHasAll = groupList.map((item) => {
                    return {id: item.group_id, ...item}
                })
                wxDivideOptionsHasAll.unshift({id: -1, title: '全部分组'})
                yield put({
                    type: 'setProperty',
                    payload: {
                        wxDivideOptionsHasAll,
                    },
                })
            }
        },
        * batchSet({payload, callback}, {call}) {
            const res = yield call(batchSet, payload)
            if (res && res.meta && res.meta.code === 200) {
                callback && callback()
            }
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        resetParams(state, action) {
            return {...state, params: getInitParams()}
        },
    }
}
