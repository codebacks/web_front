import {query, modify} from 'crm/services/shops/member'
import {parse} from 'qs'

const params = {
    limit: 10,
    offset: 0,
    query: '',
    bind_status: '',
    sms_status: '',
    store_type: '',
    range_time: [],
    start_time: '',
    end_time: '',
    total_count: '',
    total_amount: '',
    average_amount: '',
    remark: '',
    issue_status: '',
    exclude_remark: ''
}
export default {
    namespace: 'crm_members',
    state: {
        list: [],
        loading: false, //加载角色列表
        params: {...params},
        current: 1,
        record: '',
        total: 0,
        remarkModal: false,
        importModal: false,
        importStatusDesc: '上传中...'
    },

    subscriptions: {},

    effects: {
        * query({payload, callback}, {select, call, put}) {
            yield put({type: 'setProperty', payload: {loading: true}})
            let params = yield select(({crm_members}) => crm_members.params)
            let _params = {...params, ...payload.params}
            if (payload.page) {
                _params.offset = params.limit * (payload.page - 1)
            }
            // if(_params.range_time){
            //     delete _params.range_time;
            // }
            _params.range_time = ''
            const {data} = yield call(query, parse(_params))
            if (data && data.data) {
                // _params.range_time = params.range_time;
                // console.log(_params);
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.data,
                        params: _params,
                        total: data.pagination.rows_found,
                        current: payload.page === undefined ? 1 : payload.page
                    }
                })
                callback && callback(data.data)
            }
            yield put({type: 'setProperty', payload: {loading: false}})
        },
        * modify({payload, callback}, {call, put}) {
            yield put({type: 'setProperty', payload: {'editLoading': true}})
            const {data} = yield call(modify, parse(payload))
            if (data && data.data) {
                yield put({
                    type: 'updateSuccess',
                    payload: {
                        record: payload.record
                    }
                })
                callback && callback()
            }
            yield put({type: 'setProperty', payload: {'editLoading': false}})
        },
    },

    reducers: {
        setProperty(state, action) {
            return {...state, ...action.payload}
        },
        setParams(state, action) {
            let params = {...state.params, ...action.payload}
            return {...state, ...{params: params}}
        },
        updateSuccess(state, action) {
            let idx = state.list.findIndex((item) => {
                return item.id === action.payload.record.id
            })
            let list = Array.from(state.list)
            if (idx !== -1) {
                list.splice(idx, 1, action.payload.record)
            }
            return {...state, list: list}
        },
        querySuccess(state, action) {
            return {...state, ...action.payload, loading: false}
        }
    }
}
